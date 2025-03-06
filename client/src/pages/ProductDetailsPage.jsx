// client/src/pages/ProductDetailsPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";
import {
  Package,
  Tag,
  MapPin,
  User,
  MessageCircle,
  Edit2,
  Trash2,
  AlertTriangle,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ProductDetailsPage = ({ isDarkMode }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Placeholder for multiple images (only product.imageUrl is real for now)
  const getImagesArray = (mainImage) => {
    return [mainImage];
    // In the future, you can expand this to include multiple images
    // return [mainImage, image2Url, image3Url];
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProduct(response.data);
        console.log("Product data received:", response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to fetch product details. Please try again later.");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user.token]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate("/marketplace");
    } catch (err) {
      setError("Failed to delete the product. Please try again.");
    }
  };

  const handlePrevImage = () => {
    const images = getImagesArray(product?.imageUrl);
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const images = getImagesArray(product?.imageUrl);
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `Member since ${date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })}`;
  };

  // Check if the current user is the seller of the product
  const isCurrentUserSeller = () => {
    if (!product || !product.seller || !user) return false;

    // Sometimes the seller might be populated as a full object, other times just an ID
    const sellerId =
      typeof product.seller === "object" ? product.seller._id : product.seller;
    return user.userId === sellerId;
  };

  if (loading)
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );

  if (error)
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <div className="text-red-500 text-center">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );

  // Get the images array for the carousel
  const images = getImagesArray(product?.imageUrl);

  // Extract seller information safely
  const sellerInfo = product?.seller || {};
  const sellerIsObject = typeof sellerInfo === "object";
  const sellerName = sellerIsObject ? sellerInfo.username : "Unknown Seller";
  const sellerCreatedAt = sellerIsObject ? sellerInfo.createdAt : null;
  const sellerEmail = sellerIsObject ? sellerInfo.email : null;
  const sellerProfilePicture = sellerIsObject
    ? sellerInfo.profilePicture
    : null;

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/marketplace")}
          className={`mb-6 flex items-center gap-2 ${
            isDarkMode
              ? "text-gray-400 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          } transition-colors duration-200`}
        >
          ← Back to Marketplace
        </button>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Images */}
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-2xl p-4`}
          >
            <div className="relative aspect-[4/3] mb-4">
              <img
                src={images[currentImageIndex]}
                alt={product?.title}
                className="w-full h-full object-contain rounded-lg"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index
                        ? "border-blue-500"
                        : isDarkMode
                        ? "border-gray-700"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-2xl p-6`}
          >
            <div className="mb-6">
              <h1
                className={`text-3xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {product?.title}
              </h1>
              <p className="text-2xl font-bold text-blue-600 mb-4">
                ₹{product?.price?.toLocaleString()}
              </p>
              <p
                className={`text-lg mb-6 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {product?.description}
              </p>

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div
                  className={`${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  } p-3 rounded-xl`}
                >
                  <div className="flex items-center gap-2">
                    <Tag className="text-blue-500" size={18} />
                    <div>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Category
                      </p>
                      <p
                        className={`font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {product?.category || "Uncategorized"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  } p-3 rounded-xl`}
                >
                  <div className="flex items-center gap-2">
                    <Package className="text-blue-500" size={18} />
                    <div>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Condition
                      </p>
                      <p
                        className={`font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {product?.condition || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  } p-3 rounded-xl`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="text-blue-500" size={18} />
                    <div>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Location
                      </p>
                      <p
                        className={`font-medium ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {product?.location || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200">
                  <MessageCircle size={20} />
                  Contact Seller
                </button>
                {isCurrentUserSeller() && (
                  <>
                    <Link
                      to={`/edit-product/${product?._id}`}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200"
                    >
                      <Edit2 size={18} />
                      Edit
                    </Link>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-red-500 rounded-full transition-colors duration-200"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </>
                )}
              </div>

              {/* Seller Information - Using real seller data from product */}
              <div
                className={`${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                } rounded-xl p-4`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                    {sellerProfilePicture ? (
                      <img
                        src={sellerProfilePicture}
                        alt={sellerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-blue-500" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`font-semibold text-lg ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {sellerName}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {formatDate(sellerCreatedAt)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Show email if available */}
                  {sellerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-blue-500" />
                      <span
                        className={isDarkMode ? "text-white" : "text-gray-900"}
                      >
                        {sellerEmail}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-2xl p-6 max-w-md mx-4`}
            >
              <h3
                className={`text-xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Delete Product
              </h3>
              <p
                className={`mb-6 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Are you sure you want to delete this product? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-4 py-2 rounded-full ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  } transition-colors duration-200`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsPage;
