// server/models/User.js - Simplified Model

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true, // Add index for query performance
    },
    password: {
      type: String,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true, // Add index for query performance
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Completely remove the pre-save middleware for password hashing
// We'll handle this manually in the routes

// Simple validation method
userSchema.methods.isValidPassword = async function (password) {
  try {
    // Direct comparison using bcrypt
    return this.password
      ? await bcrypt.compare(password, this.password)
      : false;
  } catch (error) {
    console.error("Password validation error:", error);
    return false;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
