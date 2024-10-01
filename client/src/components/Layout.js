// src/components/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">IIITN Resell</Link>
          <nav>
            <Link to="/marketplace" className="text-gray-600 hover:text-gray-900 mx-4">Marketplace</Link>
            <Link to="/add-product" className="text-gray-600 hover:text-gray-900 mx-4">Sell</Link>
            <Link to="/profile" className="text-gray-600 hover:text-gray-900 mx-4">Profile</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <footer className="bg-gray-100">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          &copy; 2023 IIITN Resell. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;