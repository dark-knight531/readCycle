// backend/routes/book.routes.js
import { Router } from "express";
import {
    uploadBook,
    searchBooks,
    getAllBooks,
    getBookById,
    getMyBooks,
    removeBookFromCatalog,
} from "../controllers/book.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js"; 

const router = Router();

// Public route: Anyone can search or browse available books on the homepage
router.route("/search").get(searchBooks);

// Public route: Fetches all books from MongoDB for the dashboard catalog grid matrix
router.route("/all-books").get(getAllBooks); // 👈 Linked to your fresh dashboard route!

// Multer must run before controller so req.file + req.body are populated
const handleBookImageUpload = (req, res, next) => {
    upload.single("bookImage")(req, res, (err) => {
        if (err) {
            const message =
                err.code === "LIMIT_FILE_SIZE"
                    ? "Image is too large. Please use a photo under 5MB."
                    : err.message || "Failed to upload image.";
            return res.status(400).json({ success: false, message });
        }
        next();
    });
};

// Secured route: Users must be logged in to upload a book.
router.route("/upload").post(verifyJWT, handleBookImageUpload, uploadBook);

// Logged-in user's own listings (must be before /:id)
router.route("/my-books").get(verifyJWT, getMyBooks);

// Single book details + owner remove from catalog
router.route("/:id").get(getBookById).delete(verifyJWT, removeBookFromCatalog);

export default router;