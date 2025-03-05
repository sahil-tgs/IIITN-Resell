// server/routes/authRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes'
});

// Register validation
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .custom(value => {
      if (!value.endsWith('@iiitn.ac.in')) {
        throw new Error('Only @iiitn.ac.in email addresses are allowed');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Login validation
const validateLogin = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
];

router.post('/register', validateRegister, async (req, res, next) => {
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
        return res.status(400).json({ message: 'Email already in use' });
      }
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    const newUser = new User({ username, email, password });
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, validateLogin, async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Increased from 1h to 1d for better user experience
    );
    
    res.json({ 
      token, 
      userId: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    next(error);
  }
});

// Google Authentication Routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}&userId=${req.user._id}`);
  }
);

router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Verify token endpoint
router.get('/verify-token', authMiddleware, (req, res) => {
  res.status(200).json({ valid: true, userId: req.user.userId });
});

module.exports = router;