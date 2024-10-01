import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import AuthPage from './pages/AuthPage';
import ProductForm from './components/ProductForm';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for displaying all products */}
        <Route path="/" element={<ProductsPage />} />
        
        {/* Route for login and registration */}
        <Route path="/login" element={<AuthPage />} />
        
        {/* Route for creating a new product */}
        <Route path="/create-product" element={<ProductForm />} />
      </Routes>
    </Router>
  );
}

export default App;
