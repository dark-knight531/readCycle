// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { BookOpen, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError("");

    try {
      await login(formData.email, formData.password);
      // ✅ FIX 1: Navigate to the dashboard catalog!
      navigate("/dashboard");
    } catch (err) {
      // Ensure the error renders as a string
      setServerError(typeof err === 'string' ? err : err.message || "Failed to log in");
    } finally {
      // ✅ FIX 2: Added the 'finally' keyword so React knows when to stop the loader
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
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome Back</h2>
            <p className="text-sm text-slate-500">Step 2 — sign in to access your campus catalog.</p>
          </div>

          {/* --- SERVER ACCESS ERROR BANNER --- */}
          {serverError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl animate-shake">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
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
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                <a href="#forgot" className="text-xs font-semibold text-blue-600 hover:underline">Forgot?</a>
              </div>
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
                  Verifying Session...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            New to readCycle?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Create an account
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

export default Login;