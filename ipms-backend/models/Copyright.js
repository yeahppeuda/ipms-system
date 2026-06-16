const mongoose = require('mongoose');

const copyrightSchema = new mongoose.Schema({
  id: String,
  title: String,
  author: String,
  dept: String,
  status: String,
  date: String
});

module.exports = mongoose.model('Copyright', copyrightSchema);