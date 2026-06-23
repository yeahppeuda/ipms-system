const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, trim: true },
    action: { type: String, required: true },
    module: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true },
    ip: { type: String, default: '127.0.0.1' },
    severity: { type: String, default: 'info' },
    timestamp: { type: Date, default: Date.now }
  }
);

// Safe compilation check para sa Serverless (Vercel) Environment
const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

// AUTO-FIX INDEX BUG (Ligtas na pagpapatakbo nang hindi nagre-return ng unhandled crash)
if (mongoose.connection.readyState === 1) {
  ActivityLog.collection.dropIndex('id_1')
    .then(() => console.log("🧹 DATABASE CLEANUP: Successfully dropped the ghost 'id_1' index!"))
    .catch(err => {
      // Dedmahin ang error kung wala o nabura na ang index
    });
}

module.exports = ActivityLog;