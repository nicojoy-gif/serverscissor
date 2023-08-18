const express = require('express');
const bcrypt = require('bcrypt');
const admin = require('firebase-admin');
const User = require('../models/User');
const session = require("express-session");
const router = express.Router();


router.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

const serviceAccount = require('../scissors-395612-72b3ba0b0d82.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Other configurations
});
// User registration route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the username is already taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if the email is already registered
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // Create a new user in Firebase Authentication
      

      // Create a new user in your MongoDB database
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    // Find a user with the provided email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Email is already registered
      res.status(200).json({ isRegistered: true });
    } else {
      // Email is not registered
      res.status(200).json({ isRegistered: false });
    }
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'An error occurred while checking email' });
  }
});
router.delete("/:id", async (req, res) => {
  const userId = req.params.id;
  const { userId: requestUserId, isAdmin } = req.body;

  if (requestUserId === userId || isAdmin) {
    try {
      const user = await User.findByIdAndDelete(userId);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account");
  }
});

router.post("/logout", (req, res) => {
  // Perform the logout action here
  // For example, you can clear the session or perform any other necessary tasks

  // Assuming you are using session-based authentication, you can destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

module.exports = router;
