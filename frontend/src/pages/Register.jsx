// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { BookOpen, User, Mail, Lock, Phone, Eye, EyeOff, Loader2 } from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobileNumber: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (serverError) setServerError(""); // Clear errors as user re-types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError("");

    try {
      await register(
        formData.fullName,
        formData.email,
        formData.mobileNumber,
        formData.password
      );
      // Success! Send them to login to authorize their fresh credentials
      navigate("/login");
    } catch (err) {
      setServerError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      <header className="px-6 py-4 bg-white/70 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:bg-blue-700 transition-colors">
              <BookOpen size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              readCycle
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200/60 shadow-xl rounded-[2rem] p-8 relative overflow-hidden">
          
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="text-center space-y-2 mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Create Account</h2>
            <p className="text-sm text-slate-500">Step 1 — sign up, then log in to open your dashboard.</p>
          </div>

          {/* --- SERVER RESPONSE ERROR BANNER --- */}
          {serverError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl animate-shake">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
              <div className="relative flex items-center">
                <User size={18} className="absolute left-3.5 text-slate-400" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-3.5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@student.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mobile Number (For Buyer Contact)</label>
              <div className="relative flex items-center">
                <Phone size={18} className="absolute left-3.5 text-slate-400" />
                <input
                  type="tel"
                  name="mobileNumber"
                  required
                  pattern="\d{10}"
                  maxLength="10"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-3.5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Log In
            </Link>
          </div>

        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
        &copy; {new Date().getFullYear()} readCycle. All rights reserved.
      </footer>
    </div>
  );
};

export default Register;