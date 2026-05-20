// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import API from "../utils/api.js";
import { getBookImageUrl } from "../utils/bookHelpers.js";
import { BookOpen, Search, Filter, MapPin, LogOut, PlusCircle, BookMarked, ArrowLeftRight, User, Loader2, ChevronRight, Library } from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Class 10", "Class 12", "JEE Prep", "NEET Prep", "Engineering", "University/College"];

  // --- FETCH LIVE BOOK DOCUMENTS FROM MONGOOSE BACKEND ---
  // --- FETCH LIVE BOOK DOCUMENTS FROM MONGOOSE BACKEND ---
  useEffect(() => {
    const fetchLiveBooks = async () => {
      try {
        setLoading(true);
        const response = await API.get("/books/all-books");
        
        // FIX: Your ApiResponse class nests the payload array inside a secondary .data key
        if (response.data?.success) {
          const payload = response.data.data;
          setBooks(Array.isArray(payload) ? payload : []);
        }
      } catch (error) {
        console.error("Error fetching live marketplace books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveBooks();
  }, []);

  // Client-side search + category filter (matches saved book fields)
  const filteredBooks = books.filter((book) => {
    const q = searchQuery.toLowerCase().trim();
    const searchMatch =
      !q ||
      [book.title, book.author, book.subject, book.bookClass, book.publisher].some((field) =>
        field?.toLowerCase().includes(q)
      );
    const categoryMatch = selectedCategory === "All" || book.bookClass === selectedCategory;
    return searchMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* --- DASHBOARD NAVIGATION --- */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <BookOpen size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              readCycle
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/my-books" className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-all">
              <Library size={16} />
              My Books
            </Link>
            <Link to="/list-book" className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95">
              <PlusCircle size={16} />
              List a Book
            </Link>
            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="hidden md:inline">{user?.fullName || "Student"}</span>
            </div>
            <button onClick={logout} className="p-2.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-xl transition-colors shadow-sm" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* --- CORE CONTENT FRAME --- */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Campus Catalog</h1>
            <p className="text-sm text-slate-500">Find or request academic resources in your local network.</p>
          </div>
          <div className="sm:hidden flex gap-2 w-full">
            <Link to="/my-books" className="flex-1 flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-700 font-medium p-3 rounded-xl">
              <Library size={18} />
              My Books
            </Link>
            <Link to="/list-book" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-medium p-3 rounded-xl shadow-md">
              <PlusCircle size={18} />
              List a Book
            </Link>
          </div>
        </div>

        {/* --- CONTROLS PANEL --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-3 relative flex items-center">
            <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by textbook title, author, key expressions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div className="relative flex items-center">
            <Filter size={16} className="absolute left-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:border-blue-500 appearance-none text-slate-600 font-medium cursor-pointer"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- DYNAMIC CATEGORY FILTER PILL ROW --- */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-4 py-2 rounded-full border shrink-0 transition-all ${
                selectedCategory === cat ? "bg-blue-600 border-blue-600 text-white shadow-md" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- CONDITIONAL RENDER STATUS GATE --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm font-medium text-slate-400">Loading live campus database listings...</p>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => {
              const isDonate = book.status === "donate";
              const ownerName = book.donor?.fullName;
              const imageUrl = getBookImageUrl(book.bookImage);

              return (
              <Link
                key={book._id}
                to={`/book/${book._id}`}
                className="bg-white border border-slate-200/70 hover:border-blue-300 shadow-sm hover:shadow-md rounded-3xl p-5 transition-all group flex flex-col justify-between h-full cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${
                      isDonate ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {isDonate ? "Donate" : "Sell"}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-0.5">
                      <MapPin size={12} /> {book.location?.address || "Main Campus"}
                    </span>
                  </div>

                  <div className="w-full aspect-[4/3] bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden flex items-center justify-center text-slate-300 group-hover:bg-blue-50/40 transition-colors">
                    {imageUrl ? (
                      <img src={imageUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : isDonate ? (
                      <BookMarked size={40} className="group-hover:text-blue-500/30" />
                    ) : (
                      <ArrowLeftRight size={40} className="group-hover:text-blue-500/30" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">{book.bookClass} · {book.subject}</span>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 text-base line-clamp-1 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs font-medium text-slate-500">By {book.author}</p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400">
                    Listed by: <br />
                    <span className="font-semibold text-slate-700">{ownerName || "Peer Student"}</span>
                  </div>
                  <span className="flex items-center gap-1 text-blue-600 font-semibold text-xs group-hover:gap-2 transition-all">
                    View details
                    <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-slate-200 bg-white rounded-[2rem] space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">No textbooks found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">We couldn't find matches under the current search filter context parameters.</p>
          </div>
        )}
      </main>

    </div>
  );
};

export default Dashboard;