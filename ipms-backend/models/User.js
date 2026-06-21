const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true, trim: true },
    mname: { type: String, default: "", trim: true },
    lname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff"], default: "staff", required: true },
    status: { type: String, enum: ["Active", "Inactive", "Locked"], default: "Active", required: true },
    // Idinagdag para mag-record ng timestamp ng huling login
    lastLogin: { type: Date, default: null },
    // Bilang ng magkakasunod na maling password attempt — nag-rereset sa successful login
    failedAttempts: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Pre-save hook para sa password hashing
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; 

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err; 
  }
});

// Format para tugma sa frontend UI
userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id; 
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Ligtas na tinago ang password hash sa client-side browser
    ret.created = ret.createdAt ? ret.createdAt.toISOString().split("T")[0] : "";
  }
});

module.exports = mongoose.model("User", userSchema);