import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true
        },
        emailID: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        // 1. FIXED: Ensure your 10-digit mobile validator uses 'mobileNumber' 
        mobileNumber: {
            type: String,
            required: [true, "Mobile number is required"],
            trim: true,
            validate: {
                validator: function(v) {
                    return /^\d{10}$/.test(v); // Ensures exactly 10 digits
                },
                message: props => `${props.value} is not a valid 10-digit mobile number!`
            }
        },
        role: {
            type: String,
            enum: ["donor", "ngo", "seeker"],
            default: "donor"
        }
        
        // ❌ REMOVE 'age' COMPLETELY FROM HERE!
        // ❌ REMOVE ANY SEPARATE 'phoneNumber' FIELD FROM HERE!
    },
    { timestamps: true }
);

// HOOKS
userSchema.pre("save", async function () {
    // If the password field hasn't been updated, exit the function early
    if (!this.isModified("password")) return;

    // Safely hash the incoming raw string password using 10 salt rounds
    this.password = await bcrypt.hash(this.password, 10);
});

// METHODS
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password); // Explicit async resolution
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            emailID: this.emailID,
            fullName: this.fullName,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET || "readCycleSuperSecretAccessTokenKey2026", // Fallback string
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" // Fallback expiry
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET || "readCycleSuperSecretRefreshTokenKey2026", // Fallback string
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" // Fallback expiry
        }
    );
};
export const User = mongoose.model("User", userSchema);