import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js"; 
import app from './app.js';

// 1. Create a bulletproof way to find your backend folder path natively
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Force dotenv to find the .env file in the exact same folder as index.js
dotenv.config({
    path: path.resolve(__dirname, "./.env")
});

console.log("Checking ENV Loading...");
console.log("DB URL exists:", !!process.env.MONGODB_URI);

const PORT = process.env.PORT || 8000; 

// Connect to MongoDB, THEN start the Express server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed!", err);
    });