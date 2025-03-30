// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Verify token is valid
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/verify-token`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.valid) {
            // Token is valid, fetch user profile
            const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            setUser({
              ...profileResponse.data,
              token,
              userId
            });
          } else {
            // Token is invalid, clear localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            setUser(null);
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (token, userId) => {
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);

      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser({ ...response.data, token, userId });
      return true;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
  };

  const googleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const registerUser = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password,
      });

      return {
        success: true,
        message: response.data.message || "Registration successful. Please log in.",
      };
    } catch (error) {
      console.error(
          "Registration error:",
          error.response?.data?.message || error.message
      );
      return {
        success: false,
        message:
            error.response?.data?.message ||
            "Registration failed. Please try again.",
      };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, userId } = response.data;
      await login(token, userId);

      return { success: true };
    } catch (error) {
      console.error(
          "Login error:",
          error.response?.data?.message || error.message
      );
      return {
        success: false,
        message:
            error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  // Function to update user information in the context
  const updateUserInfo = (updatedUserData) => {
    if (user) {
      setUser(prev => ({
        ...prev,
        ...updatedUserData
      }));
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    googleLogin,
    registerUser,
    loginUser,
    updateUserInfo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};