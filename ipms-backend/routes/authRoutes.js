const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* =========================
   LOGIN ROUTE
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 LOGIN ATTEMPT:", email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing credentials"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    /* =========================
       CHECK IF ACCOUNT IS ACTIVE
    ========================= */
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated"
      });
    }

    /* =========================
       PASSWORD CHECK (TEMP PLAIN TEXT)
    ========================= */
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    /* =========================
       SUCCESS RESPONSE
    ========================= */
    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;