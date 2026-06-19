const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { createLog } = require('../utils/logger');

// ==========================================
// GET: Kunin lahat ng users
// ==========================================
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Error in GET /api/users:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ==========================================
// POST: Add new user (CREATE)
// ==========================================
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const newUser = new User(req.body);
    await newUser.save();

    await createLog({
      user: req.user?.email || 'System/Admin', 
      action: "Create",
      module: "User Management",
      desc: `Successfully created a new ${newUser.role} account for: ${newUser.email}`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      severity: "info"
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error("❌ Error in POST /api/users:", err);
    res.status(400).json({ message: "Error creating user", error: err.message });
  }
});

// ==========================================
// PUT: Edit existing user (UPDATE)
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const oldEmail = user.email;

    Object.assign(user, {
      fname: req.body.fname ?? user.fname,
      mname: req.body.mname ?? user.mname,
      lname: req.body.lname ?? user.lname,
      email: req.body.email ? req.body.email.toLowerCase() : user.email,
      role: req.body.role ?? user.role,
      status: req.body.status ?? user.status
    });

    if (req.body.password && req.body.password.trim() !== "") {
      user.password = req.body.password;
    }

    await user.save();

    await createLog({
      user: req.user?.email || 'System/Admin',
      action: "Update",
      module: "User Management",
      desc: `Updated profile details for user: ${oldEmail}${oldEmail !== user.email ? ` (Changed to ${user.email})` : ''}`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      severity: "warning"
    });

    res.json(user);
  } catch (err) {
    console.error("❌ Error in PUT /api/users:", err);
    res.status(400).json({ message: "Error updating user", error: err.message });
  }
});

// ==========================================
// DELETE: Remove user (DELETE)
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    await createLog({
      user: req.user?.email || 'System/Admin',
      action: "Delete",
      module: "User Management",
      desc: `Permanently deleted user account: ${user.fname} ${user.lname} (${user.email})`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      severity: "critical"
    });

    res.json({ message: "User permanently deleted from the system." });
  } catch (err) {
    console.error("❌ Error in DELETE /api/users:", err);
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});

module.exports = router;