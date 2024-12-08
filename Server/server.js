require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cors = require("cors");
const firebaseAdmin = require("firebase-admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

// Initialize the Express app
const app = express();

// Middleware to parse JSON data
app.use(express.json());

// Enable CORS (Cross-Origin Resource Sharing)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Set origin from .env file
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require(path.resolve(
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH
));

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Helper function to generate JWT
const generateJWT = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Set expiration time for JWT
  });
};

// Create a route to handle user registration
app.post("/register", async (req, res) => {
  const { user, pwd, phoneNumber, role } = req.body;

  if (!user || !pwd || !phoneNumber || !role) {
    return res
      .status(400)
      .json({ error: "Username, password, and phone number are required." });
  }

  try {
    const db = firebaseAdmin.database();
    const usersRef = db.ref("users");

    // Check if user already exists
    const snapshot = await usersRef
      .orderByChild("username")
      .equalTo(user)
      .once("value");
    if (snapshot.exists()) {
      return res.status(409).json({ error: "User already exists." });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(pwd, 10);

    // Save the user data into Firebase Realtime Database
    const newUserRef = usersRef.push();
    await newUserRef.set({
      username: user,
      password: hashedPassword, // Store the hashed password
      phoneNumber: phoneNumber,
      role: role,
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "Registration failed." });
  }
});

// Endpoint to authenticate using email and password
app.post("/auth", async (req, res) => {
  const { user, pwd } = req.body;

  if (!user || !pwd) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    const db = firebaseAdmin.database();
    const usersRef = db.ref("users");

    // Find the user by username
    const snapshot = await usersRef
      .orderByChild("username")
      .equalTo(user)
      .once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "User not found." });
    }

    // Get the user's data
    const userData = snapshot.val();
    const userId = Object.keys(userData)[0]; // Firebase stores data with unique keys
    const storedPassword = userData[userId].password;
    const roles = userData[userId].role;

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(pwd, storedPassword);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT for the user
    const email = userData[userId].email || null; // Optional: Use email from Firebase user data if available
    const accessToken = generateJWT(userId, email, roles);

    res.status(200).json({
      message: "Login successful.",
      accessToken, // Send back the JWT token
      roles,
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Login failed." });
  }
});

// Start the server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
