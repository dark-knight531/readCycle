// backend/controllers/user.controller.js
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

// --- FIXED: Self-contained helper that signs JWTs inline with fallback variables ---
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found for token validation");
        }

        const accessToken = jwt.sign(
            {
                _id: user._id,
                emailID: user.emailID,
                fullName: user.fullName,
                role: user.role
            },
            process.env.ACCESS_TOKEN_SECRET || "readCycleSuperSecretAccessTokenKey2026",
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
        );

        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.REFRESH_TOKEN_SECRET || "readCycleSuperSecretRefreshTokenKey2026",
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" }
        );

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("🔥 INTERNAL TOKEN GENERATION DETAILS:", error.message);
        throw new ApiError(500, "Token compilation loop failure: " + error.message);
    }
};

// 🌟 THE UNIVERSAL COOKIE OPTIONS (Fixes the Chrome Block) 🌟
const cookieOptions = {
    httpOnly: true,
    secure: false, // Keep false for localhost testing
    sameSite: "lax" // 👈 THIS IS THE MAGIC KEY! It allows cross-port cookies to be sent safely.
};


// 1. REGISTER USER
const registerUser = asyncHandler(async (req, res) => {
    const { email, password, fullName, mobileNumber } = req.body;

    if ([email, password, fullName, mobileNumber].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "Full Name, Email, Mobile Number and Password are required");
    }

    const existedUser = await User.findOne({ emailID: email.toLowerCase() });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const user = await User.create({
        fullName,
        emailID: email.toLowerCase(),
        password, 
        mobileNumber,
        role: "donor" 
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

// 2. LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }

        const user = await User.findOne({ emailID: email.toLowerCase() });
        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        // 🐛 Using the upgraded cookieOptions to ensure the browser sends them back!
        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { user: loggedInUser, accessToken, refreshToken },
                    "User logged in successfully"
                )
            );
    } catch (error) {
        console.error("🔥 CRITICAL LOGIN CONTROLLER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error during token verification loop."
        });
    }
});

// 3. LOGOUT USER
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { refreshToken: undefined } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// 4. GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User profile fetched successfully"));
});

// 5. REFRESH ACCESS TOKEN
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET || "readCycleSuperSecretRefreshTokenKey2026"
        );

        const user = await User.findById(decodedToken?._id);

        if (!user || incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser
};