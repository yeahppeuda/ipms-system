const express = require("express");
const router = express.Router();
const ActivityLog = require("../models/ActivityLog");

router.get("/", async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }); // Pinakabago ang nasa taas
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching logs", error: err.message });
  }
});

module.exports = router;