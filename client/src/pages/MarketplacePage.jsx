// Updated MarketplacePage.jsx to filter out sold products

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";
import { Search, Tag, Package } from "lucide-react";

const ProductCard = ({ product, isDarkMode }) => {
  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        {product.isSold && (
          <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
            SOLD OUT
          </div>
        )}
      </div>
      <div className="p-5">
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
        <div className="flex items-center gap-2 mb-4">
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
            {product.location}
          </span>
        </div>
        <Link
          to={`/product/${product._id}`}
          className={`inline-block w-full text-center py-2 rounded-full transition-colors duration-200 ${
            isDarkMode
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

const MarketplacePage = ({ isDarkMode }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [showSoldItems, setShowSoldItems] = useState(false); // New state for sold items filter
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        // Extract products from the new response format
        const productsData = response.data.products || response.data;

        setProducts(productsData);

        // By default, we filter out sold products for the marketplace
        const availableProducts = productsData.filter(
          (product) => !product.isSold
        );
        setFilteredProducts(availableProducts);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user.token]);

  useEffect(() => {
    // Apply filters, including the sold items filter
    const results = products.filter((product) => {
      // Filter by search term
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Filter by category
      const matchesCategory =
        categoryFilter === "" || product.category === categoryFilter;

      // Filter by price
      const matchesPrice =
        priceFilter === "" || filterByPrice(product.price, priceFilter);

      // Filter by sold status
      const matchesSoldStatus = showSoldItems ? true : !product.isSold;

      return (
        matchesSearch && matchesCategory && matchesPrice && matchesSoldStatus
      );
    });

    setFilteredProducts(results);
  }, [searchTerm, categoryFilter, priceFilter, showSoldItems, products]);

  const filterByPrice = (price, filter) => {
    switch (filter) {
      case "under1000":
        return price < 1000;
      case "1000to5000":
        return price >= 1000 && price <= 5000;
      case "over5000":
        return price > 5000;
      default:
        return true;
    }
  };

  // Get unique categories from products
  const categories = [
    ...new Set(products.map((product) => product.category)),
  ].filter(Boolean);

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );

  if (error)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      } transition-colors duration-300`}
    >
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="pt-8 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1
                className="text-4xl font-bold"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Marketplace
              </h1>
              <p
                className={`mt-2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Find great deals on campus
              </p>
            </div>
            <Link
              to="/add-product"
              className={`px-6 py-3 ${
                isDarkMode
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white rounded-full transition-colors duration-200 flex items-center gap-2`}
            >
              <Package size={20} />
              List New Item
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div
          className={`${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } p-6 rounded-2xl shadow-lg mb-8 transition-colors duration-300`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
              />
            </div>

            <div className="relative">
              <Tag
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
                size={20}
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border appearance-none ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Tag
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
                size={20}
              />
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border appearance-none ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
              >
                <option value="">All Prices</option>
                <option value="under1000">Under ₹1000</option>
                <option value="1000to5000">₹1000 - ₹5000</option>
                <option value="over5000">Over ₹5000</option>
              </select>
            </div>
          </div>

          {/* Show Sold Items Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showSoldItems"
              checked={showSoldItems}
              onChange={() => setShowSoldItems(!showSoldItems)}
              className="w-4 h-4 mr-2 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="showSoldItems"
              className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Show sold out items
            </label>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div
            className={`text-center py-12 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-2xl`}
          >
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl font-medium mb-2">No products found</p>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
    
export default MarketplacePage;
