// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import API from "../utils/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Automatically check if a user is already logged in when the app loads
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const response = await API.get("/users/current-user");
        
        if (response.data?.success) {
          const activeUser = response.data.data?.user || response.data.data;
          if (activeUser && (activeUser._id || activeUser.emailID)) {
            setUser(activeUser);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        // If the cookie is expired or missing, ensure state is clean
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkCurrentUser();
  }, []);

  // Secure Registration Pipeline
  const register = async (fullName, email, mobileNumber, password) => {
    try {
      const response = await API.post("/users/register", {
        fullName,
        email,
        mobileNumber, 
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed. Try again.";
    }
  };

  // Secure Session Login Pipeline
  const login = async (email, password) => {
    try {
      const response = await API.post("/users/login", { email, password });
      
      if (response.data?.success) {
        // Safe extraction matching your Network tab screenshot
        const loggedInUser = response.data.data.user || response.data.data;
        setUser(loggedInUser); 
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Invalid credentials.";
    }
  };

  // Active Session Revocation (Logout)
  const logout = async () => {
    try {
      await API.post("/users/logout");
    } catch (error) {
      console.error("Backend logout error sync:", error);
    } finally {
      setUser(null); 
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};