const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Gagamitin ang User model natin
const bcrypt = require("bcryptjs"); // Para sa pag-verify ng hashed password
const { createLog } = require("../utils/logger"); // Para ma-log ang activity ng pag-login

// POST: http://localhost:5000/api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Siguraduhing may laman ang email at password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter email and password." });
    }

    // 2. Hanapin ang user sa database gamit ang email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // 3. I-verify kung "Active" ang status ng account
    if (user.status !== "Active") {
      return res.status(403).json({ 
        success: false, 
        message: `Your account is ${user.status}. Please contact the system administrator.` 
      });
    }

    // 4. I-compare ang password gamit ang bcrypt kumpara sa naka-save na hash sa DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    // 5. Mag-record ng matagumpay na login sa iyong Activity Logs
    await createLog({
      user: user.email,
      action: "Login",
      module: "Authentication",
      desc: `User ${user.email} successfully logged in.`,
      ip: req.ip,
      severity: "info"
    });

    // 6. I-send ang tagumpay na tugon sa frontend
    // Tandaan: Ang 'password' at '_id' ay awtomatikong matatago dahil sa toJSON transform sa User.js!
    res.json({
      success: true,
      user
    });

  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
});


// POST: http://localhost:5000/api/auth/suspend
// Tinatawag ng login page kapag nag-exceed ng MAX_ATTEMPTS — nilo-lock ang account
router.post("/suspend", async (req, res) => {
  try {
    const { email, reason } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ success: true });
    }

    // Only suspend if currently Active — don't touch already Suspended/Inactive
    if (user.status === "Active") {
      user.status = "Suspended";
      await user.save();

      await createLog({
        user: email,
        action: "Suspend",
        module: "Authentication",
        desc: `Account suspended: ${email}. Reason: ${reason || "Too many failed login attempts"}.`,
        ip: req.ip,
        severity: "critical"
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("🔥 SUSPEND ERROR:", err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
});

module.exports = router;