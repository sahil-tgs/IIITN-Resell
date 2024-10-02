// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust this if your API URL is different

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (token && userId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser({ ...response.data, token });
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (token, userId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...response.data, token });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const googleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const registerUser = async (username, email, password) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, { username, email, password });
      return { success: true, message: 'Registration successful. Please log in.' };
    } catch (error) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed. Please try again.' };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token, userId } = response.data;
      await login(token, userId);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed. Please try again.' };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    googleLogin,
    registerUser,
    loginUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};