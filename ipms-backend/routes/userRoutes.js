const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { createLog } = require('../utils/logger');

// ==========================================
// GET: Kunin lahat ng users (With Auto-Inactive Logic)
// ==========================================
router.get("/", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Auto-update users to "Inactive" if they haven't logged in for 30 days
    // O kaya naman ay ginawa yung account 30 days ago pero hindi nagamit kahit minsan
    await User.updateMany(
      {
        status: "Active",
        $or: [
          { lastLogin: { $lt: thirtyDaysAgo } },
          { lastLogin: null, createdAt: { $lt: thirtyDaysAgo } }
        ]
      },
      { $set: { status: "Inactive" } }
    );

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
    const { email, actor_email, ...userData } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const newUser = new User(userData);
    await newUser.save();

    await createLog({
      user: req.user?.email || actor_email || 'System/Admin', 
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
    const { actor_email } = req.body;

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
      user: req.user?.email || actor_email || 'System/Admin',
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
// PUT: Unlock a Locked account (requires admin re-auth)
// Body: { adminPassword, actor_email }
// adminPassword belongs to the CURRENTLY LOGGED-IN ADMIN doing the
// unlocking — not the password of the locked account itself.
// ==========================================
router.put("/:id/unlock", async (req, res) => {
  try {
    const { adminPassword, actor_email } = req.body;

    if (!adminPassword) {
      return res.status(400).json({ message: "Please enter your admin password." });
    }
    if (!actor_email) {
      return res.status(401).json({ message: "Could not identify the logged-in admin. Please log in again." });
    }

    // 1. Hanapin ang account na ilo-unlock
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }
    if (targetUser.status !== "Locked") {
      return res.status(400).json({ message: "This account is not locked." });
    }

    // 2. Hanapin ang ADMIN na gumagawa ng unlock (galing sa session, hindi sa locked user)
    const admin = await User.findOne({ email: actor_email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Could not verify your admin account. Please log in again." });
    }
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can unlock accounts." });
    }

    // 3. I-verify ang ipinasok na password laban sa password ng ADMIN (hindi ng locked user)
    const isMatch = await bcrypt.compare(adminPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect admin password." });
    }

    // 4. Unlock — ibalik sa Active, i-reset ang failed attempts counter
    targetUser.status = "Active";
    targetUser.failedAttempts = 0;
    await targetUser.save();

    await createLog({
      user: admin.email,
      action: "Unlock",
      module: "User Management",
      desc: `Unlocked account: ${targetUser.email} (verified by admin ${admin.email})`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      severity: "warning"
    });

    res.json(targetUser);
  } catch (err) {
    console.error("❌ Error in PUT /api/users/:id/unlock:", err);
    res.status(500).json({ message: "Error unlocking user", error: err.message });
  }
});

// ==========================================
// DELETE: Remove user (DELETE)
// Requires admin re-auth.
// Body: { adminPassword, actor_email }
// adminPassword belongs to the CURRENTLY LOGGED-IN ADMIN doing the
// deleting — not the password of the account being deleted.
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const { adminPassword, actor_email } = req.body;

    if (!adminPassword) {
      return res.status(400).json({ message: "Please enter your admin password." });
    }
    if (!actor_email) {
      return res.status(401).json({ message: "Could not identify the logged-in admin. Please log in again." });
    }

    // 1. Hanapin ang account na ide-delete
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2. Hanapin ang ADMIN na gumagawa ng delete (galing sa session, hindi sa tina-target na user)
    const admin = await User.findOne({ email: actor_email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: "Could not verify your admin account. Please log in again." });
    }
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Only administrators can delete accounts." });
    }

    // 3. I-verify ang ipinasok na password laban sa password ng ADMIN (hindi ng target user)
    const isMatch = await bcrypt.compare(adminPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect admin password." });
    }

    // 4. Bawal mag-self-delete — para hindi mawalan ng admin access ang system
    if (targetUser._id.toString() === admin._id.toString()) {
      return res.status(403).json({ message: "You cannot delete your own account." });
    }

    // 5. Delete — sa puntong ito verified na ang admin
    await User.findByIdAndDelete(req.params.id);

    await createLog({
      user: admin.email,
      action: "Delete",
      module: "User Management",
      desc: `Permanently deleted user account: ${targetUser.fname} ${targetUser.lname} (${targetUser.email}) (verified by admin ${admin.email})`,
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