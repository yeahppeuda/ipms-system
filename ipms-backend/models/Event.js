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
  docs: [{
    name: String,
    type: { type: String }, 
    size: String,
    date: String,
    url: String
  }]
}, { timestamps: true });

// Awtomatikong pinapalitan ang _id ng id para hindi mag-error sa HTML mo
EventSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

module.exports = mongoose.model('Event', EventSchema);