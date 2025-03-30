// client/src/components/ProductForm.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";

const ProductForm = ({ product = null, onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    price: product?.price || "",
    category: product?.category || "",
    condition: product?.condition || "",
    location: product?.location || "",
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");

  // Clean up URL objects when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setFormData({ ...formData, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }

    try {
      if (product) {
        await axios.put(`${API_BASE_URL}/products/${product._id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        });
      } else {
        await axios.post(`${API_BASE_URL}/products`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        });
      }
      onSubmit();
    } catch (error) {
      console.error("Error submitting product", error);
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
        required={!product}
      />
      {previewUrl && (
        <div className="mb-4">
          <img src={previewUrl} alt="Preview" className="h-40 object-contain" />
        </div>
      )}
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        {product ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
};

export default ProductForm;
