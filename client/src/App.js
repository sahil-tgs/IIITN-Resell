// client/src/App.js
import React from 'react';
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
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route 
            path="/marketplace" 
            element={
              <PrivateRoute>
                <MarketplacePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/add-product" 
            element={
              <PrivateRoute>
                <AddProductPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/product/:id" 
            element={
              <PrivateRoute>
                <ProductDetailsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/edit-product/:id" 
            element={
              <PrivateRoute>
                <EditProductPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <UserProfilePage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;