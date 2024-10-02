// client/src/components/ProductCard.js

import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="border p-4 rounded-lg shadow-lg">
      <img src={product.imageUrl} alt={product.title} className="w-full h-48 object-cover rounded-md mb-4" />
      <h2 className="text-xl font-bold">{product.title}</h2>
      <p>{product.description}</p>
      <p className="text-gray-500">Price: ${product.price}</p>
      <p className="text-gray-500">Location: {product.location}</p>
      <p className="text-gray-500">Condition: {product.condition}</p>
      <p className="text-green-500 font-bold">{product.isSold ? 'Sold' : 'Available'}</p>
    </div>
  );
};

export default ProductCard;
