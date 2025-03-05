// client/src/pages/LandingPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Change this to match your actual auth state property

  const handleBrowseClick = () => {
    navigate('/marketplace');
  };

  const handleSellClick = () => {
    // Check if user exists instead of isAuthenticated
    if (user) {
      navigate('/add-product');
    } else {
      navigate('/login', { state: { from: { pathname: '/add-product' } } });
    }
  };

  // For debugging - remove this in production
  console.log('Auth status:', { user });

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-cream text-gray-900'} flex justify-center items-center p-4 relative overflow-hidden transition-colors duration-300`}>
      {/* Left decoration SVG */}
      <img 
        src="/left.svg" 
        alt="" 
        className="absolute left-0 h-full object-contain z-10 pointer-events-none"
        style={{
          maxWidth: '25%',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      />

      {/* Right decoration SVG */}
      <img 
        src="/right.svg" 
        alt="" 
        className="absolute right-0 h-full object-contain z-10 pointer-events-none"
        style={{
          maxWidth: '25%',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      />
      
      {/* Main content */}
      <div className="max-w-4xl w-full z-20 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-[78px] font-extrabold leading-tight mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
          Looking to<br />clear space ?
        </h1>
        <p className="text-base md:text-lg lg:text-[18px] mx-auto max-w-2xl mb-8" style={{ fontFamily: 'Open Sans, sans-serif' }}>
          IITN Resell is the marketplace for IIIT Nagpur students and faculty to buy and sell second-hand items.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
          <button 
            onClick={handleBrowseClick}
            className={`px-6 py-3 ${isDarkMode ? 'bg-blue-400 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-full text-lg font-semibold transition duration-300 w-full sm:w-auto`}
          >
            Browse Marketplace
          </button>
          <button 
            onClick={handleSellClick}
            className={`px-6 py-3 bg-transparent ${isDarkMode ? 'text-blue-400 border-blue-400 hover:bg-blue-900' : 'text-blue-600 border-blue-600 hover:bg-blue-50'} border rounded-full text-lg font-semibold transition duration-300 w-full sm:w-auto`}
          >
            Sell an Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;