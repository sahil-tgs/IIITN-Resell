// client/src/components/ProductForm.js

import React, { useState } from 'react';
import api from '../api/api';

const ProductForm = ({ product = null, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || '',
    condition: product?.condition || '',
    location: product?.location || '',
    image: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      if (product) {
        await api.put(`/products/${product._id}`, data);
      } else {
        await api.post('/products', data);
      }
      onSubmit();
    } catch (error) {
      console.error('Error submitting product', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg">
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Title"
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        placeholder="Price"
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <input
        type="text"
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="Category"
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <input
        type="text"
        name="condition"
        value={formData.condition}
        onChange={handleChange}
        placeholder="Condition"
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <input
        type="text"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location"
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <input
        type="file"
        name="image"
        onChange={handleFileChange}
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
        {product ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
};

export default ProductForm;
