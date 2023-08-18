const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require("multer");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const authRoute = require("./routes/Auth");
const profileRoute = require("./routes/Profile");
const urlRoute = require('./routes/Url')
const app = express();
const PORT = process.env.PORT || 5000;

// Load environment variables from .env file
dotenv.config();

// Check if the connection to MongoDB was successful
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Middleware // Enable CORS with custom options
app.use(helmet()); // Helmet for security headers
app.use(morgan("common")); // Morgan for request logging
app.use(express.json()); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded requests

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// Call the async function to connect to MongoDB
connectToDatabase();

// Define a sample route
app.get('/', (req, res) => {
  res.send('Hello, this is the backend server!');
});

app.use(cors());

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use('/api/url', urlRoute);
app.use('/', require('./routes/redirect'))
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
