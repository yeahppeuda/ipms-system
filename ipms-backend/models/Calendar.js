const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  dateKey: { 
    type: String, 
    required: true, 
    unique: true 
  },
  date: { 
    type: String 
  },
  note: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Calendar', calendarSchema);