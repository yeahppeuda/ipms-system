const mongoose = require('mongoose');

const patentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Siguraduhing unique ang ID
  title: { type: String, required: true },
  inventors: [String], // Array kung madami ang inventors
  dept: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  date: { type: Date, default: Date.now } // Gamitin ang Date type para sa date
});

module.exports = mongoose.model('Patent', patentSchema);