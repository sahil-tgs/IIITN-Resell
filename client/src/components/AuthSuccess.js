// client/src/components/AuthSuccess.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      const userId = searchParams.get('userId');

      if (token && userId) {
        try {
          await login(token, userId);
          navigate('/marketplace', { replace: true });
        } catch (error) {
          console.error('Login error:', error);
          setError('Failed to log in. Please try again.');
        }
      } else {
        console.error('Token or userId not found in URL');
        setError('Authentication failed. Please try logging in again.');
      }
    };

    handleAuthSuccess();
  }, [login, navigate, location]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Authentication Successful</h2>
        <p className="text-gray-700">Redirecting to marketplace...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;