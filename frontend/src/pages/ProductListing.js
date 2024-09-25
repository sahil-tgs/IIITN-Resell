import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const products = [
  { id: 1, name: 'Textbook: Introduction to Computer Science', price: 500, category: 'Books', image: 'https://via.placeholder.com/300x200', condition: 'Like New' },
  { id: 2, name: 'Scientific Calculator', price: 200, category: 'Electronics', image: 'https://via.placeholder.com/300x200', condition: 'Good' },
  { id: 3, name: 'Study Table', price: 1500, category: 'Furniture', image: 'https://via.placeholder.com/300x200', condition: 'Fair' },
  { id: 4, name: 'Lab Coat', price: 300, category: 'Clothing', image: 'https://via.placeholder.com/300x200', condition: 'New' },
  { id: 5, name: 'Engineering Drawing Set', price: 150, category: 'Stationery', image: 'https://via.placeholder.com/300x200', condition: 'Good' },
  { id: 6, name: 'Laptop Stand', price: 400, category: 'Electronics', image: 'https://via.placeholder.com/300x200', condition: 'Like New' },
];

const categories = ['All', 'Books', 'Electronics', 'Furniture', 'Clothing', 'Stationery'];

const ProductListing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'All' || product.category === selectedCategory)
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Products for Sale</h1>
        
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-1/3">
            <select
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">Category: {product.category}</p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">Condition: {product.condition}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-2xl font-bold text-primary dark:text-blue-400">₹{product.price}</span>
                  <Link
                    to={`/products/${product.id}`}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            No products found. Try adjusting your search or filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;