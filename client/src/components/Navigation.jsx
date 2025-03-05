

// src/components/Navigation.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, User, LogOut } from 'lucide-react';

const Navigation = ({ isDarkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Black line at the top */}
      <div className="h-1 bg-black fixed top-0 left-0 right-0 z-50" />
      
      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-[#0B101F] border-[#1C2333]' : 'bg-white border-gray-200'} fixed top-1 left-0 right-0 border-b z-40`}>
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link to="/" className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            IIITN Resell
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <User size={20} />
                  Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-200"
                >
                  Sign up
                </Link>
              </>
            )}
            <button 
              onClick={toggleDarkMode} 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white bg-[#1C2333]' 
                  : 'text-gray-600 hover:text-gray-800 bg-gray-100'
              } transition-colors duration-200`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer div to prevent content overlap */}
      <div className="h-[73px]" />
    </>
  );
};

export default Navigation;