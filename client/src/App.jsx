// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MarketplacePage from './pages/MarketplacePage';
import AddProductPage from './pages/AddProductPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import EditProductPage from './pages/EditProductPage';
import UserProfilePage from './pages/UserProfilePage';
import MessagesPage from './pages/MessagesPage';
import PrivateRoute from './components/PrivateRoute';
import AuthSuccess from './components/AuthSuccess';
import ChatFloatingButton from './components/ChatFloatingButton';
import { ChatProvider } from './context/ChatContext';

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user } = useAuth();

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
          <Route
              path="/messages"
              element={
                <PrivateRoute>
                  <MessagesPage isDarkMode={isDarkMode} />
                </PrivateRoute>
              }
          />
        </Routes>

        {/* Show chat button only when user is logged in */}
        {user && <ChatFloatingButton isDarkMode={isDarkMode} />}
      </div>
  );
}

function App() {
  return (
      <AuthProvider>
        <ChatProvider>
          <Router>
            <AppContent />
          </Router>
        </ChatProvider>
      </AuthProvider>
  );
}

export default App;