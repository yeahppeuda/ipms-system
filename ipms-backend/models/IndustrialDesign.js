const mongoose = require('mongoose');

const industrialDesignSchema = new mongoose.Schema({
  id: String,
  title: String,
  designer: String,
  dept: String,
  status: String,
  date: String
});

module.exports = mongoose.model('IndustrialDesign', industrialDesignSchema);