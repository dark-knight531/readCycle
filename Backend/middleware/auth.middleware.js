import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // 1. Extract token from cookies OR safely from the Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized request. No token found." });
        }

        // 2. 🐛 FIX: Added the exact fallback secret used during token creation!
        const decodedToken = jwt.verify(
            token, 
            process.env.ACCESS_TOKEN_SECRET || "readCycleSuperSecretAccessTokenKey2026"
        );

        // 3. Fetch user while stripping out password and refresh token for security
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid Access Token. User not found." });
        }

        // 4. Attach the sanitized user object to the request bundle
        req.user = user;
        
        // 5. Execute next() to transfer control to your controller safely
        next();

    } catch (error) {
        console.error("🔥 Error in verifyJWT middleware:", error.message);
        return res.status(401).json({ success: false, message: error?.message || "Invalid access token" });
    }
});