const mongoose = require('mongoose');
const moment = require('moment');
// Define the schema
const VideoSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true
  },
  href: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: moment().toDate()
  }
});

// Create the model
const Video = mongoose.model('Video', VideoSchema);

// Export the model
module.exports = Video;
