// server/server.js

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const User = require("./models/User");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security headers
app.use(helmet());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api/", apiLimiter);

// CORS Configuration - Fix for trailing slashes
const corsOptions = {
  origin: function (origin, callback) {
    // For development testing
    if (!origin) return callback(null, true);

    // Get allowed origins
    const allowedOrigins =
      process.env.NODE_ENV === "production"
        ? [process.env.PRODUCTION_CLIENT_URL, process.env.CLIENT_URL].filter(
            Boolean
          )
        : [process.env.CLIENT_URL];

    // Remove any trailing slashes
    const formattedOrigin = origin.replace(/\/$/, "");
    const formattedAllowedOrigins = allowedOrigins.map((o) =>
      o ? o.replace(/\/$/, "") : o
    );

    if (formattedAllowedOrigins.indexOf(formattedOrigin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log(
        "CORS blocked for origin:",
        origin,
        "Allowed origins:",
        formattedAllowedOrigins
      );
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Increase payload size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your session secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection with improved error handling
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if unable to connect to database
  });

// Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;

      // Check if the email is from the @iiitn.ac.in domain
      if (!email.endsWith("@iiitn.ac.in")) {
        return done(null, false, {
          message: "Only @iiitn.ac.in email addresses are allowed.",
        });
      }

      try {
        let user = await User.findOne({ email: email });
        if (!user) {
          user = new User({
            username: profile.displayName,
            email: email,
            googleId: profile.id,
            profilePicture: profile.photos[0].value,
          });
          await user.save();
        } else {
          // Update existing user's information
          user.username = profile.displayName;
          user.googleId = profile.id;
          user.profilePicture = profile.photos[0].value;
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "../client/build")));

  // All unknown routes should serve React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

// Custom error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server with improved error handling
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Better unhandled promise rejection handling
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  // Log the error but don't crash the server
  // server.close(() => process.exit(1));
});

// Handle server shutdown gracefully
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    mongoose.connection.close();
  });
});

module.exports = server; // Export for testing purposes
