import React from 'react';

const FeatureItemPreview = ({ title, description, price, image, width, height, top, left, right, bottom, zIndex }) => {
  return (
    <div 
      className="absolute bg-white rounded-lg shadow-lg overflow-hidden"
      style={{ 
        width, 
        height, 
        top, 
        left, 
        right, 
        bottom, 
        zIndex 
      }}
    >
      <img src={image} alt={title} className="w-full h-1/2 object-cover" />
      <div className="p-2">
        <h3 className="font-bold text-sm truncate">{title}</h3>
        <p className="text-xs text-gray-600 h-8 overflow-hidden">{description}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-sm">₹{price}</span>
          <button className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Contact seller</button>
        </div>
      </div>
    </div>
  );
};

export default FeatureItemPreview;