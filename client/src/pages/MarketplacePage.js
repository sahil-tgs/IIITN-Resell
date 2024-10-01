// src/pages/MarketplacePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => (
  <div className="border rounded-lg p-4 shadow-md">
    <img src={product.imageUrl} alt={product.title} className="w-full h-48 object-cover rounded-md mb-2"/>
    <h3 className="font-semibold text-lg">{product.title}</h3>
    <p className="text-gray-600">₹{product.price}</p>
    <p className="text-sm text-gray-500 mb-2">{product.condition} • {product.location}</p>
    <Link to={`/product/${product._id}`} className="text-blue-500 hover:text-blue-700">
      View Details
    </Link>
  </div>
);

const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user.token]);

  useEffect(() => {
    const results = products.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === '' || product.category === categoryFilter) &&
      (priceFilter === '' || filterByPrice(product.price, priceFilter))
    );
    setFilteredProducts(results);
  }, [searchTerm, categoryFilter, priceFilter, products]);

  const filterByPrice = (price, filter) => {
    switch(filter) {
      case 'under1000': return price < 1000;
      case '1000to5000': return price >= 1000 && price <= 5000;
      case 'over5000': return price > 5000;
      default: return true;
    }
  };

  const categories = [...new Set(products.map(product => product.category))];

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
      
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Prices</option>
          <option value="under1000">Under ₹1000</option>
          <option value="1000to5000">₹1000 - ₹5000</option>
          <option value="over5000">Over ₹5000</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;