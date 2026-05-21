import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api.js";

const ListBook = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    subject: "",
    bookClass: "University/College",
    condition: "Good",
    status: "donate",
    price: 0,
    address: ""
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [coordinates, setCoordinates] = useState(null); // null = address-only, no GPS
  const [locationStatus, setLocationStatus] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-reset price to 0 if they switch back to donate
    if (name === "status" && value === "donate") {
      setFormData({ ...formData, [name]: value, price: 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (error) setError("");
  };

  // Optional: grab GPS coordinates to improve map accuracy
  const getLocation = () => {
    setLocationStatus("Locating...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
          setLocationStatus("Location added (optional).");
        },
        () => {
          setLocationStatus("Could not get GPS. You can still submit with your typed address.");
        }
      );
    } else {
      setLocationStatus("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const selectedFile = imageFile || fileInputRef.current?.files?.[0];

    if (!selectedFile) {
      setError("Please select a book cover photo before submitting.");
      setLoading(false);
      return;
    }

    if (!formData.address.trim()) {
      setError("Please enter a pick-up address.");
      setLoading(false);
      return;
    }

    const dataToSubmit = new FormData();
    dataToSubmit.append("title", formData.title);
    dataToSubmit.append("author", formData.author);
    dataToSubmit.append("publisher", formData.publisher || "Unknown Publisher");
    dataToSubmit.append("subject", formData.subject);
    dataToSubmit.append("bookClass", formData.bookClass);
    dataToSubmit.append("condition", formData.condition);
    dataToSubmit.append("status", formData.status);
    dataToSubmit.append("price", formData.status === "sell" ? formData.price : 0);
    dataToSubmit.append("address", formData.address.trim());

    if (coordinates) {
      dataToSubmit.append("longitude", coordinates[0]);
      dataToSubmit.append("latitude", coordinates[1]);
    }

    dataToSubmit.append("bookImage", selectedFile);
    try {
      // Must match your backend route EXACTLY
      const response = await API.post("/books/upload", dataToSubmit);
      
      if (response.data?.success) {
        navigate("/dashboard");
      } else {
        setError(response.data?.message || "Failed to list book. Try again.");
      }
    } catch (err) {
      console.error("Listing submission failure:", err);
      if (err.response?.status === 401) {
        setError("Please log in before listing a book.");
        navigate("/login");
        return;
      }
      if (!err.response) {
        setError("Cannot reach the server. Check your internet connection and API URL.");
        return;
      }
      setError(err.response?.data?.message || "Failed to list book. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">List a Book on readCycle</h2>
        <p className="mt-2 text-center text-sm text-slate-600">Fill out the details to map your book to nearby students.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Core Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Book Title *</label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Author *</label>
                <input required type="text" name="author" value={formData.author} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-slate-700">Publisher</label>
                <input type="text" name="publisher" placeholder="Optional" value={formData.publisher} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Subject / Course *</label>
                <input required type="text" name="subject" placeholder="e.g., Physics, Thermodynamics" value={formData.subject} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white" />
              </div>
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Category / Class *</label>
                <select name="bookClass" value={formData.bookClass} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white">
                  <option value="Class 10">Class 10</option>
                  <option value="Class 12">Class 12</option>
                  <option value="JEE Prep">JEE Preparation</option>
                  <option value="NEET Prep">NEET Preparation</option>
                  <option value="Engineering">Engineering</option>
                  <option value="University/College">University/College General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Condition *</label>
                <select name="condition" value={formData.condition} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white">
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Heavily Used">Heavily Used</option>
                </select>
              </div>
            </div>

            {/* Status & Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div>
                <label className="block text-sm font-medium text-blue-900">Listing Type *</label>
                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500">
                  <option value="donate">Free Donation</option>
                  <option value="sell">Sell Book</option>
                </select>
              </div>
              
              {/* Only show price if they want to sell */}
              {formData.status === "sell" && (
                <div>
                  <label className="block text-sm font-medium text-blue-900">Price (₹) *</label>
                  <input required type="number" min="1" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Pick-up Address *</label>
              <textarea required name="address" rows="2" placeholder="Hostel/Block number or common campus spot..." value={formData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white resize-none" />
              <p className="mt-1 text-xs text-slate-500">Type your address — GPS is optional.</p>
            </div>

            <div className="flex items-center justify-between">
              <button type="button" onClick={getLocation} className="text-sm font-medium bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg transition-colors">
                Use My GPS Location (optional)
              </button>
              <span className="text-sm text-green-600 font-medium">{locationStatus}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Book Cover Photo *</label>
              <input
                ref={fileInputRef}
                required
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Book cover preview" className="mt-3 h-32 w-32 object-cover rounded-lg border border-slate-200" />
              )}
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-60 transition-all cursor-pointer mt-4">
              {loading ? "Uploading Data to Server..." : "Post Book"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListBook;