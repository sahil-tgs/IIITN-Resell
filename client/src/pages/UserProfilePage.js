// src/pages/UserProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

const UserProfilePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const { user } = useAuth();

  const fetchUserData = useCallback(async () => {
    if (!user || !user.token) {
      setError('User not authenticated. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUserProfile(profileResponse.data);
      setEditedProfile(profileResponse.data);

      const productsResponse = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const userProducts = productsResponse.data.filter(product => product.seller === user.userId);
      setUserProducts(userProducts);

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

  const handleEdit = () => {
    setIsEditing(true);
  };

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

  const handleChange = (e) => {
    setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
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

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!userProfile) return <div className="text-center mt-8">User profile not found.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
        {isEditing ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                name="username"
                value={editedProfile.username}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                name="email"
                value={editedProfile.email}
                onChange={handleChange}
              />
            </div>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Details
            </button>
          </>
        ) : (
          <>
            <p><strong>Username:</strong> {userProfile.username}</p>
            <p><strong>Email:</strong> {userProfile.email}</p>
            <button
              onClick={handleEdit}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Listings</h2>
        <Link to="/add-product" className="mb-4 inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Add New Product
        </Link>
        {userProducts.length === 0 ? (
          <p>You haven't listed any products yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProducts.map(product => (
              <div key={product._id} className="border rounded-lg p-4">
                <img src={product.imageUrl} alt={product.title} className="w-full h-40 object-cover rounded-md mb-2"/>
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-gray-600">₹{product.price}</p>
                <div className="mt-2">
                  <Link to={`/edit-product/${product._id}`} className="text-blue-500 hover:text-blue-700 mr-2">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;