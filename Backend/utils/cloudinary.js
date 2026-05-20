
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary with your credentials (stored safely in .env)
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detects if it's an image or PDF
            folder: "book_donation_platform" // Organizes your media files in a specific cloud folder
        });
        
        // File has been uploaded successfully, remove the locally saved temporary file
        fs.unlinkSync(localFilePath);
        return response; // Returns the full object containing secure_url and public_id
        
    } catch (error) {
        // Keep the local file so the controller can fall back to /temp/ serving
        console.error("Cloudinary upload failed — will use local storage:", error?.message || error);
        return null;
    }
};

export { uploadOnCloudinary };