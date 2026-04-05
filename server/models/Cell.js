const mongoose = require('mongoose');

const cellSchema = new mongoose.Schema({
  nullifierHash: {
    type: String,
    required: true,
    unique: true
  },
  imageData: {
    type: String,
    required: true
  },
  gridIndex: {
    type: Number,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cell', cellSchema);

