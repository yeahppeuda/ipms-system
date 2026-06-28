const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },  // category key (lowercase)
  count: { type: Number, default: 0 },                    // cumulative deleted auto-archived count
}, { timestamps: true });

module.exports = mongoose.model("Counter", CounterSchema);