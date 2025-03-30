// server/routes/authRoutes.js - Fixed Login Flow

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Re-enable rate limiting for production
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // 5 requests per windowMs
//   message: "Too many login attempts, please try again after 15 minutes",
// });

// Apply rate limiting in production only
// if (process.env.NODE_ENV === "production") {
//   router.use(["/login", "/register"], authLimiter);
// }

// Register validation
const validateRegister = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .custom((value) => {
      if (!value.endsWith("@iiitn.ac.in")) {
        throw new Error("Only @iiitn.ac.in email addresses are allowed");
      }
      return true;
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Login validation
const validateLogin = [
  body("email").trim().isEmail().withMessage("Please provide a valid email"),
  body("password").exists().withMessage("Password is required"),
];

router.post("/register", validateRegister, async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already in use" });
      }
      return res.status(400).json({ message: "Username already taken" });
    }

    // Manually hash the password before creating the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log(`User registered: ${email}`);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
});

// Improved login route
router.post("/login", validateLogin, async (req, res, next) => {
  try {
    console.log("Login attempt received");

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Manual password comparison instead of using the model method
    if (!user.password) {
      console.log(`User has no password set: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`Password validation result: ${isPasswordValid}`);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Ensure JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log(`Login successful for user: ${email}`);

    res.json({
      token,
      userId: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
});

// Google Authentication Routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Ensure JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return res.redirect("/login?error=server_configuration");
    }

    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Ensure CLIENT_URL is set
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    res.redirect(
      `${clientUrl}/auth-success?token=${token}&userId=${req.user._id}`
    );
  }
);

router.get("/profile", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Verify token endpoint
router.get("/verify-token", authMiddleware, (req, res) => {
  res.status(200).json({ valid: true, userId: req.user.userId });
});

module.exports = router;
