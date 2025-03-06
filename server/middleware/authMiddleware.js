// server/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  try {
    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error." });
    }

    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const tokenString = authHeader.split(" ")[1]; // Extract the token after 'Bearer '

    if (!tokenString) {
      return res
        .status(401)
        .json({ message: "Access denied. Invalid token format." });
    }

    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid token content." });
    }

    // Check if user still exists in database
    const userExists = await User.exists({ _id: decoded.userId });
    if (!userExists) {
      return res
        .status(401)
        .json({ message: "The user for this token no longer exists." });
    }

    req.user = { userId: decoded.userId }; // Attach userId to the request object
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    } else {
      return res.status(500).json({ message: "Authentication error." });
    }
  }
};

module.exports = verifyToken;
