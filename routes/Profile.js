const express = require('express');
const FormData = require('../models/Profile');
const router = express.Router();

const User = require('../models/User');

router.post("/submit", async (req, res) => {
  const formData = req.body;

  try {
    // Create a new instance of your Mongoose model
    const newFormData = new FormData(formData);

    // Save the form data to the database
    const savedFormData = await newFormData.save();
    console.log("Form data saved:", savedFormData);
    res.sendStatus(200);
  } catch (error) {
    console.error("Failed to save form data:", error);
    res.sendStatus(500);
  }
});

router.get('/fetchData/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch the submitted form data from the database using your Mongoose model and user's ID
    const submittedData = await FormData.find({ userId: userId });
    res.json(submittedData);
  } catch (error) {
    console.error("Failed to fetch submitted form data:", error);
    res.sendStatus(500);
  }
});

module.exports = router;