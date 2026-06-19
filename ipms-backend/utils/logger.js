const ActivityLog = require('../models/ActivityLog');

// Ginawa nating 'createLog' at nakabalot sa Object ({ }) para eksaktong tugma sa authRoutes mo!
const createLog = async ({ user, action, module, desc, ip, severity = 'info' }) => {
  try {
    const newLog = new ActivityLog({
      user,
      action,
      module, // Gagamitin ang 'module' field mula sa pinasa mo
      desc,
      ip: ip || '127.0.0.1',
      severity
    });

    await newLog.save();
    console.log("📌 LOGGER SUCCESS: Matagumpay na na-save ang login activity!");
  } catch (error) {
    console.error("❌ LOGGER ERROR (Sa loob ng utils):", error.message);
    // Hindi natin ito itatapon (no throw) para kahit magka-error ang log, makaka-login pa rin ang user
  }
};

module.exports = { createLog }; 