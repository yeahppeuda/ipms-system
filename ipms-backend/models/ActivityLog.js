const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    desc: { type: String, required: true },
    ip: { type: String, default: "Unknown" },
    severity: { type: String, enum: ["info", "warning", "critical"], default: "info" }
  },
  { timestamps: true }
);

activityLogSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    ret.timestamp = ret.createdAt;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);