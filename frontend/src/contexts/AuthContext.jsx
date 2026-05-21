// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import API, { setStoredToken, getStoredToken, clearStoredToken } from "../utils/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCurrentUser = async () => {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await API.get("/users/current-user");

        if (response.data?.success) {
          const activeUser = response.data.data?.user || response.data.data;
          if (activeUser && (activeUser._id || activeUser.emailID)) {
            setUser(activeUser);
          } else {
            clearStoredToken();
            setUser(null);
          }
        } else {
          clearStoredToken();
          setUser(null);
        }
      } catch {
        clearStoredToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, []);

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

  const login = async (email, password) => {
    try {
      const response = await API.post("/users/login", { email, password });

      if (response.data?.success) {
        const payload = response.data.data;
        const loggedInUser = payload?.user || payload;
        const accessToken = payload?.accessToken;

        if (accessToken) {
          setStoredToken(accessToken);
        }
        setUser(loggedInUser);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Invalid credentials.";
    }
  };

  const logout = async () => {
    try {
      await API.post("/users/logout");
    } catch (error) {
      console.error("Backend logout error sync:", error);
    } finally {
      clearStoredToken();
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
