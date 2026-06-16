const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true, trim: true },
    mname: { type: String, default: "", trim: true },
    lname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    dept: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin", "staff", "researcher"], default: "staff", required: true },
    status: { type: String, enum: ["Active", "Inactive", "Suspended"], default: "Active", required: true }
  },
  { timestamps: true }
);

// Hash password bago i-save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Format para tugma sa frontend UI mo
userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id; 
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Tago ang password!
    ret.created = ret.createdAt ? ret.createdAt.toISOString().split("T")[0] : "";
  }
});

module.exports = mongoose.model("User", userSchema);