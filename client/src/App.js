// client/src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MarketplacePage from './pages/MarketplacePage';
import AddProductPage from './pages/AddProductPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import EditProductPage from './pages/EditProductPage';
import UserProfilePage from './pages/UserProfilePage';
import PrivateRoute from './components/PrivateRoute';
import AuthSuccess from './components/AuthSuccess';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <AuthProvider>
      <Router>
        <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
          <Navigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          <Routes>
            <Route path="/" element={<LandingPage isDarkMode={isDarkMode} />} />
            <Route path="/login" element={<LoginPage isDarkMode={isDarkMode} />} />
            <Route path="/register" element={<RegisterPage isDarkMode={isDarkMode} />} />
            <Route path="/auth-success" element={<AuthSuccess isDarkMode={isDarkMode} />} />
            <Route 
              path="/marketplace" 
              element={
                <PrivateRoute>
                  <MarketplacePage isDarkMode={isDarkMode} />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/add-product" 
              element={
                <PrivateRoute>
                  <AddProductPage isDarkMode={isDarkMode} />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/product/:id" 
              element={
                <PrivateRoute>
                  <ProductDetailsPage isDarkMode={isDarkMode} />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/edit-product/:id" 
              element={
                <PrivateRoute>
                  <EditProductPage isDarkMode={isDarkMode} />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <UserProfilePage isDarkMode={isDarkMode} />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;