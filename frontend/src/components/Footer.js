import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <footer className="bg-white dark:bg-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          {/* ... (footer links) ... */}
        </nav>
        <div className="mt-8 flex justify-center items-center">
          <p className="text-center text-base text-gray-400 dark:text-gray-500">
            &copy; 2023 IIITN Resell. All rights reserved.
          </p>
          <button
            onClick={toggleDarkMode}
            className="ml-4 px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white transition-colors duration-200"
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;