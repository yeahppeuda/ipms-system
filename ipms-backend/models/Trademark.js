const mongoose = require('mongoose');

const trademarkSchema = new mongoose.Schema({
  id: String,
  brandName: String,
  owner: String,
  dept: String,
  status: String,
  date: String,
  googleDriveLink: { type: String, trim: true, default: '' }
});

module.exports = mongoose.model('Trademark', trademarkSchema);