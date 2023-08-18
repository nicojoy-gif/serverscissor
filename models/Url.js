const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  urlCode: {
    type: String,
  },
  sessionIdentifier: {
    type: String,
  },
  longUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
  },
  alias: { // Corrected to lowercase 'alias'
    type: String,
    unique: true,
    
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Url = mongoose.model('Url', urlSchema);

module.exports = Url;
