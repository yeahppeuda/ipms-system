const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');

// GET: http://localhost:5000/api/logs
router.get('/', async (req, res) => {
  try {
    // 1. Kunin lahat ng logs mula sa database, pinakabago muna
    const logs = await ActivityLog.find().sort({ timestamp: -1 });
    
    console.log(`📡 FETCHED FROM DB: May ${logs.length} records na nahanap.`);

    // 2. I-format nang maayos para siguradong babasahin ng admin-logs.html mo
    const formattedLogs = logs.map(log => {
      return {
        id: log._id ? log._id.toString() : "", // Nililinis ang MongoDB ID para maging plain string 'id'
        timestamp: log.timestamp ? log.timestamp.toISOString() : new Date().toISOString(),
        user: log.user || "System",
        action: log.action || "Create",
        module: log.module || "User Management",
        desc: log.desc || "",
        ip: log.ip === "::1" ? "127.0.0.1" : (log.ip || "127.0.0.1"), // Ginagawang readable ang IPv6 local loopback (::1)
        severity: log.severity ? log.severity.toLowerCase() : "info"
      };
    });

    // 3. Ipadala sa frontend
    res.json(formattedLogs);

  } catch (err) {
    console.error("🔥 FETCH LOGS ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to load logs", error: err.message });
  }
});

module.exports = router;