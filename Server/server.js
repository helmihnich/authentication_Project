require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cors = require("cors");
const firebaseAdmin = require("firebase-admin");
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

// Create a route to handle user registration
app.post("/register", async (req, res) => {
  const { user, pwd } = req.body;

  if (!user || !pwd) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
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

    // Save the user data into Firebase Realtime Database
    const newUserRef = usersRef.push();
    await newUserRef.set({
      username: user,
      password: pwd, // Normally, you'd hash the password before saving
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "Registration failed." });
  }
});

// Start the server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
