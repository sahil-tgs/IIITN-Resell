// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

const LoginPage = ({ isDarkMode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      const { token, userId } = response.data;

      // Added await here to ensure login completes before navigation
      await login(token, userId);

      const from = location.state?.from?.pathname || "/marketplace";
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-cream text-gray-900"
      } flex justify-center items-center p-4 relative overflow-hidden transition-colors duration-300`}
    >
      <div className="w-full max-w-md z-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h2
            className="text-4xl font-extrabold mt-6"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Welcome back
          </h2>
          <p
            className="mt-2 text-gray-600 dark:text-gray-400"
            style={{ fontFamily: "Open Sans, sans-serif" }}
          >
            Sign in to continue to your account
          </p>
        </div>

        {/* Login Form */}
        <div
          className={`${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } p-8 rounded-2xl shadow-lg`}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition duration-200 disabled:opacity-70 flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div
                  className={`w-full border-t ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                />
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className={`px-2 ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  } text-gray-500`}
                >
                  Or continue with
                </span>
              </div>
            </div>

            <button
              onClick={googleLogin}
              disabled={isLoading}
              className={`mt-4 w-full flex items-center justify-center py-3 px-4 rounded-full border ${
                isDarkMode
                  ? "border-gray-700 hover:bg-gray-700"
                  : "border-gray-200 hover:bg-gray-50"
              } transition duration-200 disabled:opacity-70`}
            >
              <img
                className="h-5 w-5 mr-2"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
              />
              <span className={isDarkMode ? "text-white" : "text-gray-700"}>
                Sign in with Google
              </span>
            </button>
          </div>

          <p className="mt-8 text-center text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 transition duration-200"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
