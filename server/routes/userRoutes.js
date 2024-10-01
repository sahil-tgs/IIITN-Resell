// server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product'); // Import the Product model
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'iiitn-resell-profiles',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage: storage });

// View user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error updating profile', error: error.message });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

// Upload or update profile picture (Accessible to all authenticated users)
router.put('/profile-picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = req.file.path;
    await user.save();

    res.json({ message: 'Profile picture updated successfully', profilePicture: user.profilePicture });
  } catch (error) {
    console.error('Error in profile picture upload:', error);
    res.status(500).json({ message: 'Error updating profile picture', error: error.message });
  }
});

// Get all registered users (Admin functionality only)
router.get('/all-users', authMiddleware, async (req, res) => {
  try {
    // Check if the user is an admin
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // Fetch all users but exclude passwords
    const users = await User.find().select('-password');

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Delete user account and associated data (Accessible to all authenticated users)
router.delete('/delete-account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's profile picture from Cloudinary if it exists
    if (user.profilePicture) {
      const publicId = extractPublicId(user.profilePicture);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Delete all products associated with the user
    const userProducts = await Product.find({ seller: userId });

    // Delete product images from Cloudinary
    for (const product of userProducts) {
      if (product.imageUrl) {
        const publicId = extractPublicId(product.imageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // Remove products from database
    await Product.deleteMany({ seller: userId });

    // Delete the user account
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
});

// Helper function to extract publicId from Cloudinary URL
function extractPublicId(url) {
  try {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    const publicIdWithExtension = fileName.split('.')[0]; // Remove extension
    const folder = parts[parts.length - 2]; // Get folder name if any
    return folder + '/' + publicIdWithExtension;
  } catch (error) {
    console.error('Error extracting publicId:', error);
    return null;
  }
}

module.exports = router;
