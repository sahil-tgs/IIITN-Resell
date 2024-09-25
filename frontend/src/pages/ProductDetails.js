import React from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const products = [
  { id: 1, name: 'Textbook: Introduction to Computer Science', price: 500, category: 'Books', image: 'https://via.placeholder.com/400', description: 'A comprehensive introduction to computer science fundamentals.', seller: 'John Doe', condition: 'Like New' },
  { id: 2, name: 'Scientific Calculator', price: 200, category: 'Electronics', image: 'https://via.placeholder.com/400', description: 'Advanced scientific calculator with graphing capabilities.', seller: 'Jane Smith', condition: 'Good' },
  { id: 3, name: 'Study Table', price: 1500, category: 'Furniture', image: 'https://via.placeholder.com/400', description: 'Sturdy study table with ample space for books and laptop.', seller: 'Mike Johnson', condition: 'Fair' },
  { id: 4, name: 'Lab Coat', price: 300, category: 'Clothing', image: 'https://via.placeholder.com/400', description: 'Standard white lab coat for science practicals.', seller: 'Emily Brown', condition: 'New' },
];

const ProductDetails = () => {
  const { id } = useParams();
  const { darkMode } = useTheme();
  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
    return <div className="text-center py-16 dark:text-white">Product not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col-reverse">
            <div className="w-full aspect-w-1 aspect-h-1">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-center object-cover sm:rounded-lg"
              />
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{product.name}</h1>
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl text-gray-900 dark:text-white">₹{product.price}</p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="text-base text-gray-700 dark:text-gray-300 space-y-6">
                <p>{product.description}</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <h4 className="text-sm text-gray-900 dark:text-gray-100 font-medium">Category:</h4>
                <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
              </div>
              <div className="mt-2 flex items-center">
                <h4 className="text-sm text-gray-900 dark:text-gray-100 font-medium">Condition:</h4>
                <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">{product.condition}</p>
              </div>
              <div className="mt-2 flex items-center">
                <h4 className="text-sm text-gray-900 dark:text-gray-100 font-medium">Seller:</h4>
                <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">{product.seller}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                className="w-full bg-primary border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-primary"
              >
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;