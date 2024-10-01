const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const token = req.header('Authorization');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const tokenString = token.split(' ')[1]; // Extract the token after 'Bearer '
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET); // Verify the token
    req.user = { userId: decoded.userId }; // Attach userId to the request object
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyToken;
