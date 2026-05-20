// backend/controllers/book.controller.js
import fs from "fs";
import { Book } from "../models/book.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

/**
 * @desc    Upload a new book with cover image and geo-coordinates
 * @route   POST /api/v1/books/upload
 * @access  Private (Requires verifyJWT middleware)
 */
const uploadBook = asyncHandler(async (req, res) => {
    // 1. Extract all fields from the FormData payload
    const { 
        title, author, publisher, subject, bookClass, 
        condition, status, price, address, longitude, latitude 
    } = req.body;

    // 2. Validate required fields (matching your Mongoose schema)
    if (!title || !author || !subject || !bookClass || !condition || !status || !address) {
        throw new ApiError(400, "Please provide all required book details.");
    }

    // Ensure an image was attached by Multer
    if (!req.file) {
        throw new ApiError(400, "Book cover photo is required.");
    }

    const localFilePath = req.file.path;
    let bookImageUrl;
    let cloudinaryPublicId;

    const hasCloudinary =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
        const cloudinaryResult = await uploadOnCloudinary(localFilePath);
        if (cloudinaryResult) {
            bookImageUrl = cloudinaryResult.secure_url;
            cloudinaryPublicId = cloudinaryResult.public_id;
        }
    }

    // If Cloudinary is off or failed, keep the image on this server under /public/temp
    if (!bookImageUrl) {
        if (!fs.existsSync(localFilePath)) {
            throw new ApiError(500, "Book image could not be saved. Please try again.");
        }
        bookImageUrl = `/temp/${req.file.filename}`;
        cloudinaryPublicId = req.file.filename;
    }

    // Use GPS coords when provided; otherwise store address-only with a neutral map point
    const lng = Number(longitude);
    const lat = Number(latitude);
    const hasGps = !Number.isNaN(lng) && !Number.isNaN(lat) && (lng !== 0 || lat !== 0);
    const coordinates = hasGps ? [lng, lat] : [0, 0];

    let newBook;
    try {
        newBook = await Book.create({
            title,
            author,
            publisher: publisher || "Unknown Publisher",
            subject,
            bookClass,
            condition,
            status,
            price: status === "sell" ? Number(price) : 0,
            location: {
                type: "Point",
                coordinates,
                address: address
            },
            bookImage: bookImageUrl,
            cloudinaryPublicId,
            donor: req.user._id
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message).join(" ");
            throw new ApiError(400, messages);
        }
        console.error("Book.create failed:", error);
        throw new ApiError(500, error.message || "Could not save book to database.");
    }

    return res.status(201).json(
        new ApiResponse(201, newBook, "Book listed successfully on readCycle!")
    );
});

/**
 * @desc    Search books dynamically based on text keyword match
 * @route   GET /api/v1/books/search
 * @access  Public (Anyone can browse available books)
 */
const searchBooks = asyncHandler(async (req, res) => {
    try {
        const { q } = req.query;

        // If no query string is passed, default to showing all active uncollected listings
        if (!q || q.trim() === "") {
            const allBooks = await Book.find({ isAvailable: true })
                .populate("donor", "fullName emailID mobileNumber")
                .sort({ createdAt: -1 }); // Newest arrivals show up first
                
            return res.status(200).json(
                new ApiResponse(200, allBooks, "Showing all active platform book listings.")
            );
        }

        const searchRegex = new RegExp(q.trim(), "i");

        const matchedBooks = await Book.find({
            $and: [
                { isAvailable: true }, // Filter out books already picked up/completed
                {
                    $or: [
                        { title: { $regex: searchRegex } },
                        { author: { $regex: searchRegex } },
                        { publisher: { $regex: searchRegex } },
                        { subject: { $regex: searchRegex } },
                        { bookClass: { $regex: searchRegex } }
                    ]
                }
            ]
        }).populate("donor", "fullName emailID mobileNumber");

        return res.status(200).json(
            new ApiResponse(
                200, 
                matchedBooks, 
                `Successfully found ${matchedBooks.length} books matching your search query.`
            )
        );

    } catch (error) {
        console.error("Error within searchBooks controller:", error);
        throw new ApiError(500, "Internal server error encountered while executing search query.");
    }
});

/**
 * @desc    Get all active book listings from the database for the main dashboard feed
 * @route   GET /api/v1/books/all-books
 * @access  Public
 */
const getAllBooks = asyncHandler(async (req, res) => {
    // Fetches all available books from MongoDB and populates seller details
    const allBooks = await Book.find({ isAvailable: true })
        .populate("donor", "fullName mobileNumber")
        .sort({ createdAt: -1 }); // Newest uploads appear first

    return res.status(200).json(
        new ApiResponse(200, allBooks, "All active books fetched successfully for catalog feed.")
    );
});

/**
 * @desc    Get single book with full owner contact for collection
 * @route   GET /api/v1/books/:id
 * @access  Public
 */
const getBookById = asyncHandler(async (req, res) => {
    const book = await Book.findOne({ _id: req.params.id, isAvailable: true })
        .populate("donor", "fullName mobileNumber emailID");

    if (!book) {
        throw new ApiError(404, "Book not found or is no longer available.");
    }

    return res.status(200).json(
        new ApiResponse(200, book, "Book details fetched successfully.")
    );
});

/**
 * @desc    Get all books uploaded by the logged-in user
 * @route   GET /api/v1/books/my-books
 * @access  Private
 */
const getMyBooks = asyncHandler(async (req, res) => {
    const myBooks = await Book.find({ donor: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, myBooks, "Your uploaded books fetched successfully.")
    );
});

/**
 * @desc    Remove a book from the public dashboard (mark as collected/unavailable)
 * @route   DELETE /api/v1/books/:id
 * @access  Private (owner only)
 */
const removeBookFromCatalog = asyncHandler(async (req, res) => {
    const book = await Book.findById(req.params.id);

    if (!book) {
        throw new ApiError(404, "Book not found.");
    }

    if (book.donor.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only remove your own listings.");
    }

    if (!book.isAvailable) {
        throw new ApiError(400, "This book is already removed from the catalog.");
    }

    book.isAvailable = false;
    await book.save();

    return res.status(200).json(
        new ApiResponse(200, book, "Book removed from campus catalog.")
    );
});

export {
    uploadBook,
    searchBooks,
    getAllBooks,
    getBookById,
    getMyBooks,
    removeBookFromCatalog
};