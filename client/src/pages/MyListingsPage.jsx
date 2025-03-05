  // src/pages/MyListingsPage.jsx
  import React, { useState, useEffect } from 'react';
  import { Link } from 'react-router-dom';
  import axios from 'axios';
  import API_BASE_URL from '../config/api';
  import { useAuth } from '../context/AuthContext';

  const MyListingsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/products/user`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setProducts(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching products:', err);
          setError('Failed to fetch your listings. Please try again later.');
          setLoading(false);
        }
      };

      fetchProducts();
    }, [user.token]);

    const handleDelete = async (productId) => {
      if (window.confirm('Are you sure you want to delete this product?')) {
        try {
          await axios.delete(`${API_BASE_URL}/products/${productId}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setProducts(products.filter(product => product._id !== productId));
        } catch (err) {
          console.error('Error deleting product:', err);
          setError('Failed to delete the product. Please try again.');
        }
      }
    };

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

    return (
      <div className="container mx-auto mt-8 p-4">
        <h1 className="text-3xl font-bold mb-6">My Listings</h1>
        <Link to="/add-product" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 inline-block">
          Add New Product
        </Link>
        {products.length === 0 ? (
          <p>You haven't listed any products yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
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
    );
  };

  export default MyListingsPage;