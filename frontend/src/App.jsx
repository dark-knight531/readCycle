// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import Home from "./pages/home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/dashboard.jsx";
import BookDetails from "./pages/BookDetails.jsx";
import ListBook from "./pages/ListBook.jsx";
import MyBooks from "./pages/MyBooks.jsx";

function App() {
  const { user, loading } = useAuth();

  // Show a simple clean screen while verifying cookie tokens on boot layout
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public landing — always show home first */}
        <Route path="/" element={<Home />} />

        {/* Onboarding: Home → Register → Login → Dashboard */}
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

        {/* Protected app (login required) */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/book/:id" element={user ? <BookDetails /> : <Navigate to="/login" replace />} />
        <Route path="/list-book" element={user ? <ListBook /> : <Navigate to="/login" replace />} />
        <Route path="/my-books" element={user ? <MyBooks /> : <Navigate to="/login" replace />} />
        <Route path="/add-book" element={<Navigate to="/list-book" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;