// src/pages/UserProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Package, Edit2, Trash2, Grid, List, Plus, User as UserIcon, Mail } from 'lucide-react';

const UserProfilePage = ({ isDarkMode }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const { user } = useAuth();

  const fetchUserData = useCallback(async () => {
    if (!user?.token) {
      setError('User not authenticated. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const [profileResponse, productsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        axios.get(`${API_BASE_URL}/products/user`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]);

      setUserProfile(profileResponse.data);
      setEditedProfile(profileResponse.data);
      setUserProducts(productsResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data. Please try again later.');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE_URL}/users/profile`, editedProfile, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUserProfile(editedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE_URL}/products/${productId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setUserProducts(userProducts.filter(product => product._id !== productId));
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete the product. Please try again.');
      }
    }
  };

  if (loading) return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );

  if (error) return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
      <div className="text-red-500 text-center">
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 mb-8`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <UserIcon size={32} className="text-gray-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{userProfile.username}</h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{userProfile.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors duration-200`}
            >
              <Edit2 size={18} />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          {isEditing && (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="username"
                    value={editedProfile.username}
                    onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Your Listings</h2>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {userProducts.length} {userProducts.length === 1 ? 'product' : 'products'} listed
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 p-1 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : ''}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : ''}`}
                >
                  <List size={20} />
                </button>
              </div>
              <Link
                to="/add-product"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200"
              >
                <Plus size={20} />
                Add New Listing
              </Link>
            </div>
          </div>

          {userProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-medium mb-2">No products listed yet</p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Start selling by adding your first product
              </p>
              <Link
                to="/add-product"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200"
              >
                <Plus size={20} />
                Add Product
              </Link>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {userProducts.map(product => (
                <div 
                  key={product._id} 
                  className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1`}
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      <div className="aspect-video">
                        <img 
                          src={product.imageUrl} 
                          alt={product.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                        <p className="text-xl font-bold text-blue-500 mb-4">₹{product.price.toLocaleString()}</p>
                        <div className="flex justify-between items-center">
                          <Link 
                            to={`/edit-product/${product._id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200"
                          >
                            <Edit2 size={16} />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                              isDarkMode 
                                ? 'bg-gray-600 hover:bg-gray-500' 
                                : 'bg-gray-200 hover:bg-gray-300'
                            } transition-colors duration-200`}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // List View
                    <div className="flex gap-4 p-4">
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                        <p className="text-xl font-bold text-blue-500 mb-2">₹{product.price.toLocaleString()}</p>
                        <div className="flex gap-2">
                          <Link 
                            to={`/edit-product/${product._id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200"
                          >
                            <Edit2 size={16} />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                              isDarkMode 
                                ? 'bg-gray-600 hover:bg-gray-500' 
                                : 'bg-gray-200 hover:bg-gray-300'
                            } transition-colors duration-200`}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;