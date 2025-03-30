// server/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary configuration with improved error handling
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // Set timeout to 60 seconds
});

// Setup Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "iiitn-resell-products",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// Configure multer with file size limits
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

// UPDATED: Validation middleware - Only title and price required
const validateCreateProduct = [
  body("title").notEmpty().withMessage("Title is required"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isInt({ min: 0 })
    .withMessage("Price must be a valid integer number"),
];

// Less strict validation for updates
const validateUpdateProduct = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("price")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Price must be a valid integer number"),
];

// Create a new product (with image upload)
router.post(
  "/",
  (req, res, next) => {
    console.log("POST /products - Request received");
    next();
  },
  authMiddleware,
  (req, res, next) => {
    console.log("POST /products - Auth middleware passed");
    next();
  },
  upload.single("image"),
  (req, res, next) => {
    console.log("POST /products - Image upload middleware passed");
    console.log("Request body after upload:", req.body);
    console.log("File received:", req.file);
    next();
  },
  validateCreateProduct,
  async (req, res, next) => {
    try {
      console.log("POST /products - Validation passed, processing request");

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      // If there's no image uploaded, return an error
      if (!req.file) {
        console.log("No image file found in request");
        return res.status(400).json({
          errors: [{ param: "image", msg: "Product image is required" }],
        });
      }

      // Convert price to integer
      const price = parseInt(req.body.price);
      if (isNaN(price)) {
        return res.status(400).json({
          errors: [
            { param: "price", msg: "Price must be a valid integer number" },
          ],
        });
      }

      console.log("Creating new product with data:", {
        title: req.body.title,
        description: req.body.description || "",
        price,
        category: req.body.category || "",
        condition: req.body.condition || "",
        location: req.body.location || "",
        userId: req.user.userId,
      });

      const newProduct = new Product({
        title: req.body.title,
        description: req.body.description || "",
        price: price,
        seller: req.user.userId,
        imageUrl: req.file.path,
        category: req.body.category || "",
        condition: req.body.condition || "",
        location: req.body.location || "",
      });

      console.log("About to save product to database");
      const savedProduct = await newProduct.save();
      console.log("Product saved successfully with ID:", savedProduct._id);
      res.status(201).json(savedProduct);
    } catch (error) {
      console.error("Error in POST /products handler:", error);
      next(error);
    }
  }
);

// Get all products with pagination, filtering and sorting
router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build filter query
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.condition) filter.condition = req.query.condition;
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseInt(req.query.maxPrice);
    }

    // Execute query with pagination
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ [sortField]: sortOrder })
      .populate("seller", "username profilePicture");

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalProducts: total,
    });
  } catch (error) {
    next(error);
  }
});

// Get products for the authenticated user
router.get("/user", authMiddleware, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ seller: req.user.userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ seller: req.user.userId });

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalProducts: total,
    });
  } catch (error) {
    next(error);
  }
});

// Get a single product by ID
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "username email profilePicture"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Delete a product by ID
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    // Find product first to check ownership
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user owns the product
    if (product.seller.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this product" });
    }

    // Delete product image from Cloudinary if it exists
    if (product.imageUrl) {
      const publicId = extractPublicId(product.imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId).catch((err) => {
          console.log("Error deleting product image:", err);
        });
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Update an existing product (with optional image upload)
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  validateUpdateProduct,
  async (req, res, next) => {
    try {
      // Check for validation errors, but log them for debugging first
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      // Find the product to be updated
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Ensure the user owns the product before updating it
      if (product.seller.toString() !== req.user.userId) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this product" });
      }

      // Type conversion for price (ensure it's an integer)
      const price = req.body.price ? parseInt(req.body.price) : product.price;

      // Update fields
      product.title = req.body.title || product.title;
      product.description =
        req.body.description !== undefined
          ? req.body.description
          : product.description;
      product.price = price;
      product.category =
        req.body.category !== undefined ? req.body.category : product.category;
      product.condition =
        req.body.condition !== undefined
          ? req.body.condition
          : product.condition;
      product.location =
        req.body.location !== undefined ? req.body.location : product.location;

      // If isSold is explicitly provided, update it, otherwise leave it as is
      if (req.body.isSold !== undefined) {
        product.isSold = req.body.isSold === "true" || req.body.isSold === true;
      }

      // If a new image is uploaded, update the image URL and delete old image
      if (req.file) {
        // Delete old image from Cloudinary
        if (product.imageUrl) {
          const publicId = extractPublicId(product.imageUrl);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId).catch((err) => {
              // Log but don't fail if image deletion fails
              console.log("Error deleting previous image:", err);
            });
          }
        }
        product.imageUrl = req.file.path;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      next(error);
    }
  }
);

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
    console.log("Error extracting public ID:", error);
    return null;
  }
}

module.exports = router;