import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Book title is required"],
            trim: true
        },
        author: {
            type: String,
            required: [true, "Author name is required"],
            trim: true
        },
        publisher: {
            type: String,
            trim: true,
            default: "Unknown Publisher"
        },
        subject: {
            type: String,
            required: [true, "Subject/Category is required"],
            trim: true,
            lowercase: true // Keeps searching uniform (e.g., "physics" instead of "Physics")
        },
        bookClass: {
            type: String,
            required: [true, "Target class or standard is required"],
            trim: true // e.g., "Class 10", "Class 12", "NEET Prep", "Engineering"
        },
        condition: {
            type: String,
            enum: ["New", "Good", "Fair", "Heavily Used"],
            required: [true, "Book condition must be specified"]
        },
        status: {
            type: String,
            enum: ["donate", "sell"],
            required: [true, "Specify whether you want to donate or sell this book"]
        },
        price: {
            type: Number,
            default: 0,
            // Custom validator: If status is 'sell', price MUST be greater than 0
            validate: {
                validator: function (value) {
                    if (this.status === "sell" && value <= 0) return false;
                    if (this.status === "donate" && value !== 0) return false;
                    return true;
                },
                message: "For selling, price must be greater than 0. For donation, price must be 0."
            }
        },
        bookImage: {
            type: String, // Secure URL string returned from Cloudinary
            required: [true, "Book photo upload is mandatory"]
        },
        cloudinaryPublicId: {
            type: String, // Saved so we can delete the image from Cloudinary when the book is taken
            required: [true, "Cloudinary public ID is required"]
        },
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Links this specific book to the User who uploaded it
            required: true
        },
        // Geolocation tracking for Google Maps
        location: {
            type: {
                type: String,
                enum: ["Point"], // GeoJSON format standard
                default: "Point"
            },
            coordinates: {
                type: [Number], // Array of numbers: [longitude, latitude]
                required: [true, "Location coordinates are required"]
            },
            address: {
                type: String,
                required: [true, "Physical pick-up address is required"],
                trim: true
            }
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// 1. Create a 2dsphere index for location to allow proximity/distance searching later
bookSchema.index({ location: "2dsphere" });

// 2. Create Text Indexes to allow the homepage search bar to query multiple fields at once
bookSchema.index({ 
    title: "text", 
    author: "text", 
    publisher: "text", 
    subject: "text", 
    bookClass: "text" 
});

export const Book = mongoose.model("Book", bookSchema);