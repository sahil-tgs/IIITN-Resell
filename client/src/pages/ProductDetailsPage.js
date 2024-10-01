// src/pages/ProductDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

const ProductDetailsPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to fetch product details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user.token]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        navigate('/marketplace');
      } catch (err) {
        setError('Failed to delete the product. Please try again.');
      }
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!product) return <div className="text-center mt-8">Product not found.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
      <img src={product.imageUrl} alt={product.title} className="w-full h-64 object-cover rounded-lg mb-4"/>
      <p className="text-xl font-semibold mb-2">₹{product.price}</p>
      <p className="mb-4">{product.description}</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Condition:</strong> {product.condition}</p>
        </div>
        <div>
          <p><strong>Location:</strong> {product.location}</p>
          <p><strong>Seller:</strong> {product.seller}</p>
        </div>
      </div>
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => {/* Implement contact seller logic */}}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Contact Seller
        </button>
        {user.userId === product.seller && (
          <div>
            <Link
              to={`/edit-product/${product._id}`}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;