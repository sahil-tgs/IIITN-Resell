// client/src/pages/EditProductPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";
import {
  Package,
  Tag,
  MapPin,
  ImagePlus,
  Loader,
  PencilLine,
  Type,
  FileText,
  X,
  AlertCircle,
} from "lucide-react";

const EditProductPage = ({ isDarkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use formData state similar to AddProductPage
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
  });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const conditionOptions = [
    { value: "New", label: "New" },
    { value: "Like New", label: "Like New" },
    { value: "Good", label: "Good" },
    { value: "Fair", label: "Fair" },
    { value: "Poor", label: "Poor" },
  ];

  // Fetch product details and pre-populate the form
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = response.data;
        setFormData({
          title: data.title,
          description: data.description || "",
          price: data.price,
          category: data.category || "",
          condition: data.condition || "",
          location: data.location || "",
        });
        setCurrentImage(data.imageUrl);
      } catch (err) {
        setError("Failed to fetch product details. Please try again.");
      }
    };

    fetchProduct();
  }, [id, user.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const optimizeAndSetImage = (file) => {
    // You can add image size validation here if needed
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is too large. Please select an image smaller than 5MB.");
      return;
    }

    setError("");
    setValidationErrors([]);
    setImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      optimizeAndSetImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      optimizeAndSetImage(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors([]);
    setIsLoading(true);

    try {
      // Only validate title and price
      if (!formData.title || formData.title.trim() === "") {
        setError("Title is required");
        setValidationErrors([{ param: "title", msg: "Title is required" }]);
        setIsLoading(false);
        return;
      }

      if (!formData.price || isNaN(parseInt(formData.price))) {
        setError("Valid price is required");
        setValidationErrors([
          { param: "price", msg: "Valid price is required" },
        ]);
        setIsLoading(false);
        return;
      }

      // Build the FormData explicitly with all required fields
      const submitData = new FormData();
      submitData.append("title", formData.title.trim());
      submitData.append("description", formData.description || "");
      submitData.append("price", parseInt(formData.price)); // Convert to integer
      submitData.append("category", formData.category || "");
      submitData.append("condition", formData.condition || "");
      submitData.append("location", formData.location || "");

      // Only append image if a new one is selected
      if (image) {
        submitData.append("image", image);
      }

      // console.log("Updating product with data:", {
      //   title: formData.title.trim(),
      //   description: formData.description || "",
      //   price: parseInt(formData.price),
      //   category: formData.category || "",
      //   condition: formData.condition || "",
      //   location: formData.location || "",
      //   imageUpdated: !!image,
      // });

      const response = await axios.put(
        `${API_BASE_URL}/products/${id}`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
          timeout: 60000,
        }
      );

      if (response.data) {
        // console.log("Product updated successfully:", response.data);
        navigate(`/product/${id}`);
      }
    } catch (err) {
      console.error("Error updating product:", err);

      if (err.code === "ECONNABORTED") {
        setError(
          "Request timed out. The image might be too large or your connection is slow."
        );
      } else if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        setValidationErrors(err.response.data.errors);
        setError("Please fix the validation errors below.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "An error occurred while updating the product. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasFieldError = (fieldName) => {
    return validationErrors.some(
      (error) => error.path === fieldName || error.param === fieldName
    );
  };

  const getFieldErrorMessage = (fieldName) => {
    const errorObj = validationErrors.find(
      (error) => error.path === fieldName || error.param === fieldName
    );
    return errorObj ? errorObj.msg : "";
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } py-8`}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className={`text-3xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Edit Product
            </h1>
            <p
              className={`mt-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Update your product details
            </p>
          </div>
          <button
            onClick={() => navigate(`/product/${id}`)}
            className={`px-4 py-2 rounded-full ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            } transition-colors duration-200`}
          >
            Cancel
          </button>
        </div>

        {/* Main Form */}
        <div
          className={`${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-2xl shadow-lg p-6`}
        >
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={20} />
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="mb-8">
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Product Image
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-4 text-center ${
                  isDragging
                    ? "border-blue-500"
                    : hasFieldError("image")
                    ? "border-red-500"
                    : isDarkMode
                    ? "border-gray-600"
                    : "border-gray-300"
                } transition-colors duration-200`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {previewUrl || currentImage ? (
                  <div className="relative w-full aspect-video">
                    <img
                      src={previewUrl || currentImage}
                      alt="Product preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="py-8">
                    <ImagePlus
                      className={`mx-auto h-12 w-12 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <p
                      className={`mt-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Drag and drop an image, or{" "}
                      <span className="text-blue-500">browse</span>
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {hasFieldError("image") && (
                <p className="mt-2 text-sm text-red-600">
                  {getFieldErrorMessage("image")}
                </p>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Title *
              </label>
              <div className="relative">
                <Type
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter product title"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    hasFieldError("title")
                      ? "border-red-500 focus:ring-red-500"
                      : isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {hasFieldError("title") && (
                <p className="mt-2 text-sm text-red-600">
                  {getFieldErrorMessage("title")}
                </p>
              )}
            </div>

            {/* Description Input */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Description
              </label>
              <div className="relative">
                <FileText
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe your product (optional)"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    hasFieldError("description")
                      ? "border-red-500 focus:ring-red-500"
                      : isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {hasFieldError("description") && (
                <p className="mt-2 text-sm text-red-600">
                  {getFieldErrorMessage("description")}
                </p>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Input */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1"
                    placeholder="Enter price"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      hasFieldError("price")
                        ? "border-red-500 focus:ring-red-500"
                        : isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {hasFieldError("price") && (
                  <p className="mt-2 text-sm text-red-600">
                    {getFieldErrorMessage("price")}
                  </p>
                )}
              </div>

              {/* Category Input */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Category
                </label>
                <div className="relative">
                  <Tag
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Enter category (optional)"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      hasFieldError("category")
                        ? "border-red-500 focus:ring-red-500"
                        : isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {hasFieldError("category") && (
                  <p className="mt-2 text-sm text-red-600">
                    {getFieldErrorMessage("category")}
                  </p>
                )}
              </div>

              {/* Condition Select */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Condition
                </label>
                <div className="relative">
                  <Package
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border appearance-none ${
                      hasFieldError("condition")
                        ? "border-red-500 focus:ring-red-500"
                        : isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select condition (optional)</option>
                    {conditionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {hasFieldError("condition") && (
                  <p className="mt-2 text-sm text-red-600">
                    {getFieldErrorMessage("condition")}
                  </p>
                )}
              </div>

              {/* Location Input */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location (optional)"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      hasFieldError("location")
                        ? "border-red-500 focus:ring-red-500"
                        : isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {hasFieldError("location") && (
                  <p className="mt-2 text-sm text-red-600">
                    {getFieldErrorMessage("location")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(`/product/${id}`)}
                className={`px-6 py-3 rounded-full ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                } transition-colors duration-200`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Updating...
                  </>
                ) : (
                  <>
                    <PencilLine size={20} />
                    Update Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;
