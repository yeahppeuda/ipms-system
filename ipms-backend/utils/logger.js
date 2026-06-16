const ActivityLog = require("../models/ActivityLog");

const logActivity = async (req, action, moduleName, desc, severity = "info") => {
  try {
    // Fallback if walang JWT auth pa:
    const performedBy = req.user ? `${req.user.fname} ${req.user.lname}` : "Admin System"; 
    const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";

    const newLog = new ActivityLog({
      user: performedBy,
      action: action,
      module: moduleName,
      desc: desc,
      ip: ipAddress,
      severity: severity
    });

    await newLog.save();
  } catch (err) {
    console.error("Logger error:", err);
  }
};

module.exports = logActivity;