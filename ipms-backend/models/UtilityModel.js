const mongoose = require('mongoose');

const utilityModelSchema = new mongoose.Schema({
  id: String,
  title: String,
  creator: String,
  dept: String,
  status: String,
  date: String
});

module.exports = mongoose.model('UtilityModel', utilityModelSchema);