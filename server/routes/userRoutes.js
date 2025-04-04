// server/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const bcrypt = require("bcryptjs");

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // Set timeout to 60 seconds for uploads
});

// Cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "iiitn-resell-profiles",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// View user profile
router.get("/profile", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res, next) => {
  try {
    const { username, email } = req.body;

    // Validate input
    if (!username || !email) {
      return res
        .status(400)
        .json({ message: "Username and email are required" });
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user.userId },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { username, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Complete rewrite of change password endpoint
router.put("/change-password", authMiddleware, async (req, res, next) => {
  try {
    console.log("Password change request received");
    const { currentPassword, newPassword } = req.body;

    // Input validation
    if (!currentPassword || !newPassword) {
      console.log("Missing required fields");
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      console.log("New password too short");
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long" });
    }

    // Find the user by ID
    const user = await User.findById(req.user.userId);

    if (!user) {
      console.log(`User not found with ID: ${req.user.userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Debugging: Check if password field exists
    console.log(`User found: ${user.email}`);
    console.log(`Password field exists: ${!!user.password}`);

    // Check if user has a password (Google OAuth users might not have one)
    if (!user.password) {
      console.log("No password set for this account");
      return res.status(400).json({
        message:
          "No password set for this account. This may be a Google-linked account.",
      });
    }

    // Manually verify the current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log(`Current password validation: ${isMatch}`);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Generate hash for the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password directly in the database instead of using the model
    const updateResult = await User.updateOne(
      { _id: req.user.userId },
      { $set: { password: hashedPassword } }
    );

    console.log(`Database update result:`, updateResult);

    // Double-check that the update worked
    const updatedUser = await User.findById(req.user.userId);
    const newPasswordValid = await bcrypt.compare(
      newPassword,
      updatedUser.password
    );
    console.log(`New password verification: ${newPasswordValid}`);

    res.json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Password change error:", error);
    next(error);
  }
});

// Upload or update profile picture
router.put(
  "/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete previous profile picture from Cloudinary if it exists
      if (user.profilePicture) {
        const publicId = extractPublicId(user.profilePicture);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId).catch((err) => {
            // Just log the error but don't stop the operation
            console.log("Error deleting previous profile picture:", err);
          });
        }
      }

      user.profilePicture = req.file.path;
      await user.save();

      res.json({
        message: "Profile picture updated successfully",
        profilePicture: user.profilePicture,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all registered users (Admin functionality only)
router.get("/all-users", authMiddleware, async (req, res, next) => {
  try {
    // Check if the user is an admin
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Fetch all users but exclude passwords
    const users = await User.find().select("-password");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Delete user account and associated data
router.delete("/delete-account", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's profile picture from Cloudinary if it exists
    if (user.profilePicture) {
      const publicId = extractPublicId(user.profilePicture);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId).catch((err) => {
          console.log("Error deleting profile picture:", err);
        });
      }
    }

    // Delete all products associated with the user
    const userProducts = await Product.find({ seller: userId });

    // Delete product images from Cloudinary
    for (const product of userProducts) {
      if (product.imageUrl) {
        const publicId = extractPublicId(product.imageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId).catch((err) => {
            console.log("Error deleting product image:", err);
          });
        }
      }
    }

    // Remove products from database
    await Product.deleteMany({ seller: userId });

    // Delete the user account
    await User.findByIdAndDelete(userId);

    res.json({
      message: "Account and all associated data deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to extract publicId from Cloudinary URL
function extractPublicId(url) {
  try {
    if (!url) return null;

    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    const publicIdWithExtension = fileName.split(".")[0]; // Remove extension
    const folder = parts[parts.length - 2]; // Get folder name if any
    return folder + "/" + publicIdWithExtension;
  } catch (error) {
    return null;
  }
}

module.exports = router;
