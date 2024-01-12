const mongoose = require('mongoose');
const moment = require('moment');
// Define the schema
const PostSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true
  },
  href: {
    type: String,
    required: true
  },
  nameSite: {
    type: String,
    required: true
  },
  nameActor: {
    type: String,
    required: true
  },
  nameFile: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: moment().toDate()
  }
});

// Create the model
const Post = mongoose.model('Post', PostSchema);

// Export the model
module.exports = Post;
