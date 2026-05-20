
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import API from "../utils/api.js";
import { getBookImageUrl } from "../utils/bookHelpers.js";
import {
  BookOpen,
  ArrowLeft,
  PlusCircle,
  LogOut,
  User,
  Loader2,
  Trash2,
  MapPin,
  BookMarked,
  ArrowLeftRight,
} from "lucide-react";

const MyBooks = () => {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  const fetchMyBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/books/my-books");
      if (response.data?.success) {
        const payload = response.data.data;
        setBooks(Array.isArray(payload) ? payload : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your books.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBooks();
  }, [fetchMyBooks]);

  const handleRemove = async (bookId) => {
    if (!window.confirm("Remove this book from the campus catalog? It will no longer appear on the dashboard.")) {
      return;
    }

    try {
      setRemovingId(bookId);
      const response = await API.delete(`/books/${bookId}`);
      if (response.data?.success) {
        setBooks((prev) =>
          prev.map((b) => (b._id === bookId ? { ...b, isAvailable: false } : b))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Could not remove book.");
    } finally {
      setRemovingId(null);
    }
  };

  const activeBooks = books.filter((b) => b.isAvailable);
  const removedBooks = books.filter((b) => !b.isAvailable);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <BookOpen size={22} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              readCycle
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Catalog
            </Link>
            <Link
              to="/list-book"
              className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-md"
            >
              <PlusCircle size={16} />
              List a Book
            </Link>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="hidden md:inline">{user?.fullName || "Student"}</span>
            </div>
            <button
              onClick={logout}
              className="p-2.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-xl"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Books</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your uploads. Remove donated or collected books so they disappear from the dashboard.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-24 gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm text-slate-400">Loading your listings...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl">
            <BookOpen className="mx-auto text-slate-300 mb-4" size={40} />
            <h3 className="font-bold text-lg text-slate-800">No books uploaded yet</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">List your first book to share with campus peers.</p>
            <Link
              to="/list-book"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm"
            >
              <PlusCircle size={18} />
              List a Book
            </Link>
          </div>
        ) : (
          <>
            {activeBooks.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800">
                  Live on catalog ({activeBooks.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeBooks.map((book) => (
                    <BookCard
                      key={book._id}
                      book={book}
                      onRemove={handleRemove}
                      removingId={removingId}
                    />
                  ))}
                </div>
              </section>
            )}

            {removedBooks.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-500">
                  Removed from catalog ({removedBooks.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                  {removedBooks.map((book) => (
                    <BookCard key={book._id} book={book} removed />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const BookCard = ({ book, onRemove, removingId, removed }) => {
  const isDonate = book.status === "donate";
  const imageUrl = getBookImageUrl(book.bookImage);
  const isRemoving = removingId === book._id;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
            isDonate
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
        >
          {isDonate ? "Donate" : "Sell"}
        </span>
        {removed ? (
          <span className="text-[10px] font-bold text-slate-400 uppercase">Removed</span>
        ) : (
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Live</span>
        )}
      </div>

      <div className="aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : isDonate ? (
          <BookMarked size={36} className="text-slate-300" />
        ) : (
          <ArrowLeftRight size={36} className="text-slate-300" />
        )}
      </div>

      <div>
        <h3 className="font-bold text-slate-900 line-clamp-1">{book.title}</h3>
        <p className="text-xs text-slate-500">by {book.author}</p>
        <p className="text-[10px] text-blue-600 font-semibold uppercase mt-1">
          {book.bookClass} · {book.subject}
        </p>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
          <MapPin size={12} />
          {book.location?.address || "—"}
        </p>
      </div>

      <div className="flex gap-2 mt-auto">
        {!removed && (
          <>
            <Link
              to={`/book/${book._id}`}
              className="flex-1 text-center py-2.5 text-sm font-semibold border border-slate-200 rounded-xl hover:border-blue-300 hover:text-blue-600"
            >
              View
            </Link>
            <button
              type="button"
              onClick={() => onRemove(book._id)}
              disabled={isRemoving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold bg-rose-50 text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-100 disabled:opacity-60"
            >
              {isRemoving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MyBooks;
