// app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// --- GLOBAL MIDDLEWARE CONFIGURATIONS ---

// Secure Cross-Origin Resource Sharing (CORS) Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173", 
    credentials: true // Vital: Permits your React app to send/receive secure HTTP-Only cookies
}));

// Payload Optimization & Security
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Static Assets Hosting Folder
app.use(express.static("public"));

// Request Cookie Interceptor
app.use(cookieParser());


// --- ROUTES IMPORTS ---
import userRouter from "./routes/user.routes.js";
import bookRouter from "./routes/book.routes.js";


// --- ROUTES DECLARATIONS ---

// Mounting User profiles and Authentication paths
app.use("/api/v1/users", userRouter);

// Mounting Book cataloging, matching, and searching paths
app.use("/api/v1/books", bookRouter);


// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "ValidationError" && err.errors) {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(" ");
    }

    console.error(`[${req.method} ${req.path}]`, message);

    return res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
    });
});


// --- GLOBAL ERROR CATCH-ALL ROUTE ---
//  Change "*" to "/*" or remove the string entirely to match everything safely!
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Requested API endpoint route does not exist on this server."
    });
});

export default app;