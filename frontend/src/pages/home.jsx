// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { BookOpen, ArrowRight, ShieldCheck, MapPin, RefreshCw } from "lucide-react";

const Home = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* --- TOP HEADER NAVIGATION --- */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/80 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-500/20 text-white">
              <BookOpen size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              readCycle
            </span>
          </div>
          
          {/* Top Navigation Links */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg">
                  Dashboard
                </Link>
                <Link to="/list-book" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                  List a Book
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg">
                  Log In
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Heading, Subtext, and CTA Buttons */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/60 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Empowering Student Communities
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Donate, Swap, and Find <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Academic Books
            </span> Nearby.
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Stop letting expensive textbooks collect dust. Join <strong className="text-slate-900 font-semibold">readCycle</strong> to seamlessly hand off academic materials to juniors, swap subjects with classmates, or find donation books using live location pinning.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98]"
            >
              {user ? "Go to Dashboard" : "Get Started"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto flex items-center justify-center bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 px-8 py-4 rounded-2xl transition-all shadow-sm"
            >
              {user ? "Browse Books" : "I already have an account"}
            </Link>
          </div>
        </div>

        {/* Right Column: Clean Book Image Container */}
        <div className="lg:col-span-5 flex justify-center items-center relative w-full mt-8 lg:mt-0">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-80 sm:h-80 bg-blue-400/15 rounded-full blur-3xl -z-10"></div>
          
          {/* Glass Card Container */}
          <div className="w-full max-w-[460px] aspect-[4/3] sm:aspect-square bg-white border border-slate-200/60 shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-sm relative overflow-hidden flex items-center justify-center p-2 animate-fadeIn">
            {/* Textbook graphic layout source target */}
            <img 
              src="/hero-books.png" 
              alt="Campus textbooks with academic eyeglasses" 
              className="w-full h-full object-cover rounded-[1.5rem] sm:rounded-[2rem]"
            />
          </div>
        </div>
      </main>

      {/* --- VALUE PROPOSITION / FEATURES BANNER --- */}
      <section className="bg-white border-t border-slate-200 mt-12 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1: Verification */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left p-4 space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Verified Peer Network</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Secure token verification ensures you are always interacting with authenticated student profiles on campus.</p>
          </div>

          {/* Feature 2: Geo-location */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left p-4 space-y-3">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
              <MapPin size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Geospatial Pinning</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Locate textbooks right in your local sector or housing area using accurate map indexing controls.</p>
          </div>

          {/* Feature 3: Sustainability */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left p-4 space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
              <RefreshCw size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Zero Commercial Waste</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Promote sustainable campus recycling loops by circulating books across multiple student generations.</p>
          </div>
          
        </div>
      </section>

    </div>
  );
};

export default Home;