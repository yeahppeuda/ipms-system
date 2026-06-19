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

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// AUTO-FIX INDEX BUG: Puwersahang buburahin ng code na ito ang multong 'id_1' index sa MongoDB mo!
ActivityLog.collection.dropIndex('id_1')
  .then(() => console.log("🧹 DATABASE CLEANUP: Successfully dropped the ghost 'id_1' index!"))
  .catch(err => {
    // Huwag mag-alala kung mag-error dito, ibig sabihin lang ay wala o nabura na talaga ang index kanina
  });

module.exports = ActivityLog;