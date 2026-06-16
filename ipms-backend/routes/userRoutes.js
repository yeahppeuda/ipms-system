const express = require("express");
const router = express.Router();
const User = require("../models/User");
const logActivity = require("../utils/logger");

// GET: Kunin lahat ng users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// POST: Add new user
router.post("/", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ message: "Email already registered." });

    const newUser = new User(req.body);
    await newUser.save();

    await logActivity(req, "Create", "User Management", `Added new user: ${newUser.email}`, "info");
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: "Error creating user", error: err.message });
  }
});

// PUT: Edit existing user
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    Object.assign(user, {
      fname: req.body.fname ?? user.fname,
      mname: req.body.mname ?? user.mname,
      lname: req.body.lname ?? user.lname,
      email: req.body.email ?? user.email,
      dept: req.body.dept ?? user.dept,
      role: req.body.role ?? user.role,
      status: req.body.status ?? user.status
    });

    if (req.body.password && req.body.password.trim() !== "") {
      user.password = req.body.password;
    }

    await user.save();
    await logActivity(req, "Update", "User Management", `Updated details for: ${user.email}`, "warning");
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Error updating user", error: err.message });
  }
});

// DELETE: Remove user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    await logActivity(req, "Delete", "User Management", `Permanently deleted user: ${user.email}`, "critical");
    res.json({ message: "User deleted." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});

// PATCH: Toggle Status
router.patch("/:id/status", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found." });

    await logActivity(req, "Update", "User Management", `Changed status of ${user.email} to ${req.body.status}`, "warning");
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Error updating status", error: err.message });
  }
});

// POST: Reset Password
router.post("/:id/reset-password", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    await logActivity(req, "Reset Password", "User Management", `Triggered password reset for: ${user.email}`, "warning");
    res.json({ message: "Password reset instructions sent." });
  } catch (err) {
    res.status(500).json({ message: "Error processing request", error: err.message });
  }
});

module.exports = router;