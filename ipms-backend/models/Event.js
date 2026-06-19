const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  mode: String,
  date: String,
  duration: Number,
  hours: Number,
  male: Number,
  female: Number,
  profile: [String],
  sector: [String],
  ageRange: [String],
  gdriveLink: { type: String, trim: true, default: "" }, 
  docs: [{
    name: String,
    type: { type: String }, 
    size: String,
    date: String,
    url: String
  }]
}, { timestamps: true });

EventSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

module.exports = mongoose.model('Event', EventSchema);