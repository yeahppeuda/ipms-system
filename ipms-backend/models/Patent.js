const mongoose = require('mongoose');

const patentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, 
  title: { type: String, required: true },
  inventors: [String], 
  dept: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  date: { type: Date, default: Date.now },
  googleDriveLink: { type: String, trim: true, default: '' }
});

module.exports = mongoose.model('Patent', patentSchema);