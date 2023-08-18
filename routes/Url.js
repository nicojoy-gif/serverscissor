const express = require('express');
const shortid = require('shortid');
const qr = require('qr-image');
const validUrl = require('valid-url');
const Url = require('../models/Url'); // Import the URL model
const qrcode = require('qrcode'); // Import the qrcode library

const router = express.Router();

// Replace <your_custom_domain> with your actual custom domain or use 'http://localhost:5000' as the default
const baseUrl = '<your_custom_domain>';

// Function to generate a custom alias
const generateCustomAlias = async () => {
  // Generate a random unique alias using nanoid
  return shortid.generate(); // You can specify the length of the alias as needed
};
router.post('/shorten', async (req, res) => {
  const { alias, url, customDomain, sessionIdentifier } = req.body;
  console.log('Received sessionIdentifier:', sessionIdentifier);
  const baseUrl = customDomain || 'http://localhost:5000';

  // Check base url
  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json('Invalid base URL');
  }

  // Check if alias is provided or generate a custom alias
  let generatedAlias;
  if (!alias) {
    generatedAlias = await generateCustomAlias();
  } else {
    generatedAlias = alias.toLowerCase();
    const existing = await Url.findOne({ urlCode: generatedAlias });
    if (existing) {
      return res.status(409).json({ error: 'Alias already in use' });
    }
  }

  if (validUrl.isUri(url)) {
    try {
      let dbAlias = await Url.findOne({ urlCode: generatedAlias });
      if (dbAlias) {
        res.json(dbAlias);
      } else {
        const urlCode = generatedAlias;
        const shortUrl = baseUrl + '/' + urlCode;
        dbAlias = new Url({
          longUrl: url,
          shortUrl,
          sessionIdentifier,
          urlCode,
          date: new Date(),
          alias: generatedAlias,
           // Include the session identifier in the URL object
        });
        await dbAlias.save();

        // Generate QR code as a data URL
        const qrCodeDataUrl = await generateQRCodeDataUrl(shortUrl);
        dbAlias.qrCode = qrCodeDataUrl;
        await dbAlias.save();

        res.json(dbAlias);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json('Server Error');
    }
  } else {
    res.status(401).json('Invalid longUrl');
  }
});


// Function to generate QR code data URL
const generateQRCodeDataUrl = async (text) => {
  try {
    const qrDataUrl = await qrcode.toDataURL(text);
    return qrDataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
};

// Server-side route for fetching QR code d// Server-side route for generating and saving QR code data URI
router.post('/scan/:urlCode', async (req, res) => {
  try {
    const urlCode = req.params.urlCode;
    // Find the long URL in the database based on the urlCode
    const urlData = await Url.findOne({ urlCode });

    if (!urlData) {
      return res.status(404).json({ error: 'URL not found' }); // Send error message in JSON format
    }
    
    

    const longUrl = urlData.longUrl;

    // Generate the QR code for the long URL as a data URI
    const qrCodeDataUrl = await generateQRCodeDataUrl(longUrl);

    // Save the QR code data URI in the database (you can use your URL model here)
    urlData.qrCode = qrCodeDataUrl;
    await urlData.save();

    // Return the QR code data URI as the response
    res.json({ qrCodeDataUrl });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server Error' }); // Send error message in JSON format
  }
});

router.get('/all', async (req, res) => {
  try {
    // Fetch all URLs from the database
    const allUrls = await Url.find({}, 'longUrl shortUrl urlCode alias clicks date');
    res.json(allUrls); // Return the URLs in the response as JSON
  } catch (err) {
    console.log(err);
    res.status(500).json('Server Error');
  }
});

router.get('/byuser/:sessionIdentifier', async (req, res) => {
  try {
    const sessionIdentifier = req.params.sessionIdentifier;
    console.log("Session Identifier:", sessionIdentifier);

    // Fetch the URLs associated with the session identifier
    const userUrls = await Url.find({ sessionIdentifier }, 'longUrl shortUrl urlCode alias clicks date');
    console.log("User URLs:", userUrls);

    res.json(userUrls);
  } catch (err) {
    console.log(err);
    res.status(500).json('Server Error');
  }
});





router.get("/:urlId", async (req, res) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.urlId }); // Use urlCode instead of urlId
    console.log(url);
    if (url) {
      url.clicks++;
      url.save();
      return res.redirect(url.longUrl); // Redirect to the original longUrl
    } else {
      res.status(404).json("Not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json("Server Error");
  }
});


module.exports = router;
