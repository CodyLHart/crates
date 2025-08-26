import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import emailService from "../services/emailService.js";

dotenv.config();

const router = express.Router();

// MongoDB connection
const uri = process.env.ATLAS_URI;
const client = new MongoClient(uri);

// Rate limiting
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: "Too many registration attempts, please try again later." },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: "Too many login attempts, please try again later." },
});

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectDB();

// Register new user
router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address" });
    }

    const database = client.db("crates");
    const users = database.collection("users");

    // Check if user already exists
    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create verification token
    const verificationToken = jwt.sign(
      { email: email.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Create user
    const user = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      isVerified: false,
      verificationToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(user);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login user
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const database = client.db("crates");
    const users = database.collection("users");

    // Find user
    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ error: "Please verify your email address before logging in" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Verify email
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    console.log("Verification attempt with token:", token);

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const database = client.db("crates");
    const users = database.collection("users");

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded successfully:", { email: decoded.email });
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      if (jwtError.name === "TokenExpiredError") {
        return res
          .status(400)
          .json({ error: "Verification token has expired" });
      }
      return res.status(400).json({ error: "Invalid verification token" });
    }

    // Find user by email first
    const user = await users.findOne({ email: decoded.email });
    console.log(
      "User found:",
      user
        ? {
            id: user._id,
            isVerified: user.isVerified,
            hasToken: !!user.verificationToken,
          }
        : "Not found"
    );

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User is already verified" });
    }

    if (!user.verificationToken) {
      return res
        .status(400)
        .json({ error: "No verification token found for user" });
    }

    // Check if token matches
    if (user.verificationToken !== token) {
      console.log(
        "Token mismatch. Stored:",
        user.verificationToken,
        "Received:",
        token
      );
      return res
        .status(400)
        .json({ error: "Verification token does not match" });
    }

    // Update user
    const result = await users.updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          verificationToken: null,
          updatedAt: new Date(),
        },
      }
    );

    console.log("User updated successfully:", result);

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Email verification failed" });
  }
});

// Request password reset
router.post("/forgot-password", registerLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const database = client.db("crates");
    const users = database.collection("users");

    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Create reset token
    const resetToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Update user with reset token
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          updatedAt: new Date(),
        },
      }
    );

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error("Password reset email sending failed:", emailError);
    }

    res.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Password reset request failed" });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    const database = client.db("crates");
    const users = database.collection("users");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user with valid reset token
    const user = await users.findOne({
      _id: new ObjectId(decoded.userId),
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpires: null,
          updatedAt: new Date(),
        },
      }
    );

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Reset token has expired" });
    }
    res.status(500).json({ error: "Password reset failed" });
  }
});

// Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const database = client.db("crates");
    const users = database.collection("users");

    // Find user by email
    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ error: "User is already verified" });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Update user with new verification token
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          verificationToken,
          updatedAt: new Date(),
        },
      }
    );

    // Send new verification email
    try {
      await emailService.sendVerificationEmail(user.email, verificationToken);
      res.json({ message: "Verification email sent successfully" });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      res.status(500).json({ error: "Failed to send verification email" });
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const database = client.db("crates");
    const users = database.collection("users");

    const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
