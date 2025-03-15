// src/pages/UserProfilePage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { useAuth } from "../context/AuthContext";
import {
  Edit,
  Package,
  AlertCircle,
  User,
  Mail,
  Save,
  X,
  Lock,
  Upload,
  Eye,
  EyeOff,
  Loader,
  Trash2,
  Check,
  ShoppingBag,
} from "lucide-react";

const UserProfilePage = ({ isDarkMode }) => {
  const [userData, setUserData] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Product action states
  const [productToDelete, setProductToDelete] = useState(null);
  const [productToMarkSold, setProductToMarkSold] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile and user products in parallel
        const [userResponse, productsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${API_BASE_URL}/products/user`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        setUserData(userResponse.data);
        setProfileForm({
          username: userResponse.data.username,
          email: userResponse.data.email,
        });

        // Handle the new API response format
        if (productsResponse.data.products) {
          setUserProducts(productsResponse.data.products);
        } else if (Array.isArray(productsResponse.data)) {
          setUserProducts(productsResponse.data);
        } else {
          setUserProducts([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user.token]);

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    setUpdateLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/profile`,
        profileForm,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setUserData(response.data);
      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setUpdateLoading(true);
    setError("");
    setSuccessMessage("");

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords don't match");
      setUpdateLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setUpdateLoading(false);
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/users/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setSuccessMessage("Password updated successfully!");
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateProfilePicture = async () => {
    if (!profileImage) return;

    setUpdateLoading(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("profilePicture", profileImage);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUserData((prev) => ({
        ...prev,
        profilePicture: response.data.profilePicture,
      }));
      setSuccessMessage("Profile picture updated successfully!");
      setProfileImage(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update profile picture"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // Product management functions
  const handleDeleteProduct = async (productId) => {
    setActionLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Remove the deleted product from the state
      setUserProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );

      setSuccessMessage("Product deleted successfully!");
      setProductToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSoldStatus = async (product) => {
    setActionLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const newSoldStatus = !product.isSold;

      const response = await axios.put(
        `${API_BASE_URL}/products/${product._id}`,
        { isSold: newSoldStatus },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      // Update the product in the state
      setUserProducts((prevProducts) =>
        prevProducts.map((p) =>
          p._id === product._id ? { ...p, isSold: newSoldStatus } : p
        )
      );

      setSuccessMessage(
        `Product marked as ${newSoldStatus ? "sold" : "available"}!`
      );
      setProductToMarkSold(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update product status"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setProfileForm({
      username: userData.username,
      email: userData.email,
    });
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setProfileImage(null);
    setImagePreview("");
    setError("");
    setSuccessMessage("");
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="mr-2 mt-0.5" size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Profile Section */}
        <div
          className={`mb-8 p-6 rounded-2xl ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          {isEditing ? (
            /* Edit Profile Mode */
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <div className="flex gap-2">
                  <button
                    onClick={cancelEditing}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    } transition-colors duration-200`}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={updateLoading}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                      isDarkMode
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    } transition-colors duration-200 ${
                      updateLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {updateLoading ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Profile Picture Edit */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Profile Picture
                </label>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 relative">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : userData?.profilePicture ? (
                        <img
                          src={userData.profilePicture}
                          alt={userData.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {userData?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="relative">
                      <input
                        type="file"
                        id="profile-picture"
                        onChange={handleProfileImageChange}
                        accept="image/*"
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <label
                        htmlFor="profile-picture"
                        className={`cursor-pointer px-4 py-2 rounded-lg flex items-center gap-2 w-fit ${
                          isDarkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        } transition-colors duration-200`}
                      >
                        <Upload size={18} />
                        Choose Image
                      </label>
                    </div>
                    {profileImage && (
                      <div className="mt-3 flex gap-2">
                        <span className="text-sm">{profileImage.name}</span>
                        <button
                          onClick={handleUpdateProfilePicture}
                          disabled={updateLoading}
                          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                            isDarkMode
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          } transition-colors duration-200 ${
                            updateLoading ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                        >
                          {updateLoading ? (
                            <Loader size={14} className="animate-spin" />
                          ) : (
                            <Save size={14} />
                          )}
                          Upload
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Info Edit */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Username
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="username"
                    value={profileForm.username}
                    onChange={handleProfileFormChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileFormChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              {/* Password Change Toggle */}
              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 w-fit ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  } transition-colors duration-200`}
                >
                  <Lock size={18} />
                  Change Password
                </button>
              ) : (
                <div className="space-y-4 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
                  <h3 className="font-medium">Change Password</h3>

                  {/* Current Password */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordFormChange}
                        className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordFormChange}
                        className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordFormChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsChangingPassword(false)}
                      className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                        isDarkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      } transition-colors duration-200`}
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdatePassword}
                      disabled={updateLoading}
                      className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                        isDarkMode
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      } transition-colors duration-200 ${
                        updateLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {updateLoading ? (
                        <Loader size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Regular Profile View Mode */
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                  {userData?.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt={userData.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {userData?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold">{userData?.username}</h1>
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  } mb-2`}
                >
                  {userData?.email}
                </p>
                <p
                  className={`${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Member since:{" "}
                  {new Date(userData?.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                } transition-colors duration-200`}
              >
                <Edit size={18} />
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* My Listings Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Listings</h2>
            <Link
              to="/add-product"
              className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                isDarkMode
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              } transition-colors duration-200`}
            >
              <Package size={18} />
              Add New Listing
            </Link>
          </div>

          {/* Ensure userProducts is an array before mapping */}
          {Array.isArray(userProducts) && userProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProducts.map((product) => (
                <div
                  key={product._id}
                  className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Sold Out Overlay */}
                    {product.isSold && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold transform -rotate-12">
                          SOLD OUT
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className={`font-semibold text-lg ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {product.title}
                      </h3>

                      {product.isSold && (
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                          SOLD
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xl font-bold ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      } mb-3`}
                    >
                      ₹{product.price.toLocaleString()}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.condition && (
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.condition}
                        </span>
                      )}
                      {product.category && (
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.category}
                        </span>
                      )}
                    </div>

                    {/* View & Edit Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Link
                        to={`/product/${product._id}`}
                        className={`text-center py-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        } transition-colors duration-200`}
                      >
                        View
                      </Link>
                      <Link
                        to={`/edit-product/${product._id}`}
                        className={`text-center py-2 rounded-full ${
                          isDarkMode
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        } transition-colors duration-200`}
                      >
                        Edit
                      </Link>
                    </div>

                    {/* Mark As Sold & Delete Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Toggle Sold Status Button */}
                      <button
                        onClick={() => setProductToMarkSold(product)}
                        className={`flex items-center justify-center gap-1 py-2 rounded-full transition-colors duration-200 ${
                          product.isSold
                            ? isDarkMode
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                            : isDarkMode
                            ? "bg-orange-600 hover:bg-orange-700 text-white"
                            : "bg-orange-600 hover:bg-orange-700 text-white"
                        }`}
                      >
                        {product.isSold ? (
                          <>
                            <ShoppingBag size={16} />
                            <span>Mark Available</span>
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            <span>Mark Sold</span>
                          </>
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setProductToDelete(product)}
                        className={`flex items-center justify-center gap-1 py-2 rounded-full ${
                          isDarkMode
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        } transition-colors duration-200`}
                      >
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-12 rounded-2xl ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <Package size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-medium mb-2">No listings yet</p>
              <p
                className={`${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                } mb-6`}
              >
                You haven't listed any products for sale
              </p>
              <Link
                to="/add-product"
                className={`inline-block px-6 py-3 rounded-full ${
                  isDarkMode
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } transition-colors duration-200`}
              >
                Add Your First Listing
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
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
              Are you sure you want to delete "{productToDelete.title}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-full ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                } transition-colors duration-200 disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(productToDelete._id)}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  "Delete Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Sold Confirmation Modal */}
      {productToMarkSold && (
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
              {productToMarkSold.isSold ? "Mark as Available" : "Mark as Sold"}
            </h3>
            <p
              className={`mb-6 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {productToMarkSold.isSold
                ? `Are you sure you want to mark "${productToMarkSold.title}" as available? It will appear in the marketplace again.`
                : `Are you sure you want to mark "${productToMarkSold.title}" as sold? It will no longer appear in the marketplace.`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProductToMarkSold(null)}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-full ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                } transition-colors duration-200 disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleSoldStatus(productToMarkSold)}
                disabled={actionLoading}
                className={`px-4 py-2 ${
                  productToMarkSold.isSold
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-orange-500 hover:bg-orange-600"
                } text-white rounded-full transition-colors duration-200 disabled:opacity-50`}
              >
                {actionLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : productToMarkSold.isSold ? (
                  "Mark as Available"
                ) : (
                  "Mark as Sold"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
