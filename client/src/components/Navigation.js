import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun } from 'lucide-react';

const Navigation = ({ isDarkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-transparent p-4 absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>IIITN Resell</Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/profile" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>Profile</Link>
              <button onClick={handleLogout} className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300">Sign up</Link>
            </>
          )}
          <button onClick={toggleDarkMode} className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;