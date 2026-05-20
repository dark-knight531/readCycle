import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../utils/api.js";
import { getBookImageUrl } from "../utils/bookHelpers.js";
import {
  BookOpen,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Loader2,
  BookMarked,
  ArrowLeftRight,
  IndianRupee,
} from "lucide-react";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await API.get(`/books/${id}`);
        if (response.data?.success) {
          setBook(response.data.data);
        } else {
          setError("Could not load book details.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Book not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm text-slate-500">Loading book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center gap-4">
        <p className="text-rose-600 font-medium">{error || "Book not found."}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isDonate = book.status === "donate";
  const imageUrl = getBookImageUrl(book.bookImage);
  const owner = book.donor;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600">
            <ArrowLeft size={18} />
            Back to Catalog
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <BookOpen size={20} />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              readCycle
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="bg-slate-100 aspect-square md:aspect-auto md:min-h-[400px] flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : isDonate ? (
                <BookMarked size={80} className="text-slate-300" />
              ) : (
                <ArrowLeftRight size={80} className="text-slate-300" />
              )}
            </div>

            <div className="p-8 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border uppercase ${
                    isDonate
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {isDonate ? "Free Donation" : "For Sale"}
                </span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {book.bookClass}
                </span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{book.title}</h1>
                <p className="text-slate-500 mt-1">by {book.author}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail label="Subject" value={book.subject} />
                <Detail label="Publisher" value={book.publisher || "—"} />
                <Detail label="Condition" value={book.condition} />
                {!isDonate && (
                  <Detail
                    label="Price"
                    value={
                      <span className="inline-flex items-center gap-0.5 font-bold text-blue-600">
                        <IndianRupee size={14} />
                        {book.price}
                      </span>
                    }
                  />
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 p-8 space-y-6 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900">Pick-up & contact</h2>
            <p className="text-sm text-slate-500">
              Contact the owner and visit this address to collect the book.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <MapPin size={16} className="text-blue-600" />
                  Pick-up address
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {book.location?.address || "Address not provided"}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <User size={16} className="text-blue-600" />
                  Listed by
                </div>
                <p className="font-bold text-slate-900">{owner?.fullName || "Peer Student"}</p>
                {owner?.mobileNumber && (
                  <a
                    href={`tel:${owner.mobileNumber}`}
                    className="flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                  >
                    <Phone size={16} />
                    {owner.mobileNumber}
                  </a>
                )}
                {owner?.emailID && (
                  <a
                    href={`mailto:${owner.emailID}`}
                    className="flex items-center gap-2 text-slate-600 text-sm hover:text-blue-600"
                  >
                    <Mail size={16} />
                    {owner.emailID}
                  </a>
                )}
              </div>
            </div>

            {owner?.mobileNumber && (
              <a
                href={`tel:${owner.mobileNumber}`}
                className="flex w-full items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
              >
                <Phone size={20} />
                Call to arrange collection
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400 font-semibold uppercase">{label}</p>
    <div className="font-medium text-slate-800 mt-0.5">{value}</div>
  </div>
);

export default BookDetails;
