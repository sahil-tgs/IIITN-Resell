// src/pages/UserProfilePage.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";
import { Edit, Package, AlertCircle } from "lucide-react";

const UserProfilePage = ({ isDarkMode }) => {
  const [userData, setUserData] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile and user products in parallel
        const [userResponse, productsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${API_BASE_URL}/products/user`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        setUserData(userResponse.data);

        // Handle the new API response format
        // Check if productsResponse.data.products exists (new format) or if it's an array (old format)
        if (productsResponse.data.products) {
          setUserProducts(productsResponse.data.products);
        } else if (Array.isArray(productsResponse.data)) {
          setUserProducts(productsResponse.data);
        } else {
          // Default to empty array if neither format is detected
          setUserProducts([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user.token]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <div
          className={`mb-8 p-6 rounded-2xl ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt={userData.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {userData?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold">{userData?.username}</h1>
              <p
                className={`${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                } mb-2`}
              >
                {userData?.email}
              </p>
              <p
                className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                Member since:{" "}
                {new Date(userData?.createdAt).toLocaleDateString()}
              </p>
            </div>

            <Link
              to="/edit-profile"
              className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              } transition-colors duration-200`}
            >
              <Edit size={18} />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* My Listings Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Listings</h2>
            <Link
              to="/add-product"
              className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                isDarkMode
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              } transition-colors duration-200`}
            >
              <Package size={18} />
              Add New Listing
            </Link>
          </div>

          {/* Ensure userProducts is an array before mapping */}
          {Array.isArray(userProducts) && userProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProducts.map((product) => (
                <div
                  key={product._id}
                  className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    {product.isSold && (
                      <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                        SOLD
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3
                      className={`font-semibold text-lg mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {product.title}
                    </h3>
                    <p
                      className={`text-xl font-bold ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      } mb-3`}
                    >
                      ₹{product.price.toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.condition}
                      </span>
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/product/${product._id}`}
                        className={`flex-1 text-center py-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        } transition-colors duration-200`}
                      >
                        View
                      </Link>
                      <Link
                        to={`/edit-product/${product._id}`}
                        className={`flex-1 text-center py-2 rounded-full ${
                          isDarkMode
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        } transition-colors duration-200`}
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-12 rounded-2xl ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <Package size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-medium mb-2">No listings yet</p>
              <p
                className={`${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                } mb-6`}
              >
                You haven't listed any products for sale
              </p>
              <Link
                to="/add-product"
                className={`inline-block px-6 py-3 rounded-full ${
                  isDarkMode
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } transition-colors duration-200`}
              >
                Add Your First Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
