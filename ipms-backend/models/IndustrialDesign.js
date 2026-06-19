const mongoose = require('mongoose');

const industrialDesignSchema = new mongoose.Schema({
  id: String,
  title: String,
  designer: String,
  dept: String,
  status: String,
  date: String,
  googleDriveLink: { type: String, trim: true, default: '' }
});

module.exports = mongoose.model('IndustrialDesign', industrialDesignSchema);