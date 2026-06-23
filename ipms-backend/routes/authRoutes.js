const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User"); 
const bcrypt = require("bcryptjs"); 
const { createLog } = require("../utils/logger"); 

const MONGO_URI = "mongodb+srv://ipms2026:2026ipms@ipms-cluster.zwbn5c9.mongodb.net/ipmsdb?retryWrites=true&w=majority&appName=ipms-cluster";

router.post("/login", async (req, res) => {
  try {if (mongoose.connection.readyState !== 1) {
      console.log("⏳ Kumokonekta sa MongoDB Atlas bago mag-login...");
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000 // Mag-fail agad sa loob ng 5s imbes na mag-hang nang matagal
      });
      console.log("✅ Database Connected inside authRoutes!");
    }
    
    const { email, password } = req.body;

    // 1. Siguraduhing may laman ang email at password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter email and password." });
    }

    // 2. Hanapin ang user sa database gamit ang email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Account not registered." });
    }

    // 3. I-verify kung "Locked" ang status ng account
    if (user.status === "Locked") {
      return res.status(403).json({ 
        success: false, 
        message: "Your account is locked due to multiple failed login attempts. Please contact the system administrator." 
      });
    }

    // 4. I-compare ang password gamit ang bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const MAX_ATTEMPTS = 5;
      user.failedAttempts = (user.failedAttempts || 0) + 1;

      // I-lock ang account pagkatapos ng 5 magkakasunod na maling attempt
      if (user.failedAttempts >= MAX_ATTEMPTS) {
        user.status = "Locked";
        await user.save();

        await createLog({
          user: user.email,
          action: "Lock",
          module: "Authentication",
          desc: `Account locked: ${user.email}. Reason: Too many failed login attempts (${user.failedAttempts}).`,
          ip: req.ip,
          severity: "critical"
        });

        return res.status(403).json({
          success: false,
          message: "Your account is locked due to multiple failed login attempts. Please contact the system administrator."
        });
      }

      await user.save();

      const attemptsLeft = MAX_ATTEMPTS - user.failedAttempts;
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining before this account is locked.`
      });
    }

    // 5. Tamang password — i-reset ang failed attempts, update lastLogin at ibalik sa Active kung galing sa Inactive
    user.failedAttempts = 0;
    user.lastLogin = new Date();
    if (user.status === "Inactive") {
      user.status = "Active";
    }
    await user.save();

    // 6. Mag-record ng matagumpay na login sa Activity Logs
    await createLog({
      user: user.email,
      action: "Login",
      module: "Authentication",
      desc: `User ${user.email} successfully logged in.`,
      ip: req.ip,
      severity: "info"
    });

    // I-strip ang sensitive fields bago ibalik sa frontend
    const { password: _pw, failedAttempts: _fa, ...safeUser } = user.toObject();

    res.json({
      success: true,
      user: safeUser
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
      return res.json({ success: true });
    }

    // Gawing Locked ang account kung hindi pa siya Locked
    if (user.status !== "Locked") {
      user.status = "Locked";
      await user.save();

      await createLog({
        user: email,
        action: "Lock",
        module: "Authentication",
        desc: `Account locked: ${email}. Reason: ${reason || "Too many failed login attempts"}.`,
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


// Ginagamit ng frontend auth guard on page load para i-verify kung valid pa ang session.
// Naghahanap ng user sa database gamit ang email na nakaimbak sa localStorage/sessionStorage.
// Kung hindi na makita o locked na ang account, ibabalik ang 401/403 para mag-redirect sa login.
router.get("/validate", async (req, res) => {
  try {
    const email = req.query.email || req.headers["x-user-email"];

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    if (user.status === "Locked") {
      return res.status(403).json({ success: false, message: "Account is locked." });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({ success: false, message: "Account is inactive." });
    }

    // I-strip ang sensitive fields
    const { password: _pw, failedAttempts: _fa, ...safeUser } = user.toObject();

    res.json({ success: true, user: safeUser });

  } catch (err) {
    console.error("🔥 VALIDATE ERROR:", err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
});

module.exports = router;