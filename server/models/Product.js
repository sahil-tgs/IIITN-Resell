// server/models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true, // Add index for price filtering
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Add index for seller queries
    },
    imageUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true, // Add index for category filtering
    },
    condition: {
      type: String,
      required: true,
      enum: ["New", "Like New", "Good", "Fair", "Poor"],
      index: true, // Add index for condition filtering
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    isSold: {
      type: Boolean,
      default: false,
      index: true, // Add index for sold/available filtering
    },
  },
  { timestamps: true }
);

// Add a compound index for common filtering combinations
productSchema.index({ price: 1, category: 1, isSold: 1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
