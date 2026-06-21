const express  = require("express");
const router   = express.Router();
const Research = require("../models/Research");
const { createLog } = require('../utils/logger');

// ── CREATE (Mag-add ng bagong IP Asset) ─────────────────────────
router.post("/", async (req, res) => {
  try {
    const { actor_email, ...researchData } = req.body;
    const research = new Research(researchData);
    await research.save();

    await createLog({
      user: req.user?.email || actor_email || "System/Admin",
      action: "Create",
      module: research.category || "Reports", 
      desc: `Registered new IP record: "${research.researchTitle}" (Ref ID: ${research.referenceId || 'N/A'})`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      severity: "info"
    });

    res.json(research);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET ALL ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const data = await Research.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET BY CATEGORY ─────────────────────────────────
router.get("/:category", async (req, res) => {
  try {
    const data = await Research.find({ category: req.params.category }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── UPDATE (Mag-edit ng IP Asset Details at Archive fields) ───────────────────────
router.put("/:id", async (req, res) => {
  try {
    const b = req.body;
    const strOrNull = (v) => (v && v.toString().trim() !== "" ? v.toString().trim() : null);
    const updateData = {};

    if (b.researchTitle   !== undefined) updateData.researchTitle  = b.researchTitle;
    if (b.referenceId     !== undefined) updateData.referenceId    = b.referenceId;
    if (b.department      !== undefined) updateData.department     = b.department;
    if (b.college         !== undefined) updateData.college        = b.college;
    if (b.authors         !== undefined) updateData.authors        = b.authors;
    if (b.status          !== undefined) updateData.status         = b.status;
    if (b.date            !== undefined) updateData.date           = b.date;
    if (b.category        !== undefined) updateData.category       = b.category;
    if (b.googleDriveLink !== undefined) updateData.googleDriveLink = strOrNull(b.googleDriveLink);
    
    // Archive Flow variables mapping
    if (b.archived        !== undefined) updateData.archived       = b.archived;
    if (b.archiveDate     !== undefined) updateData.archiveDate    = b.archiveDate;

    // Always write defect fields explicitly
    updateData.defectNoticeDate  = strOrNull(b.defectNoticeDate);
    updateData.defectNoticeDate2 = strOrNull(b.defectNoticeDate2);
    updateData.defectNoticeDate3 = strOrNull(b.defectNoticeDate3);
    updateData.defectNoticeDate4 = strOrNull(b.defectNoticeDate4);
    updateData.defectNoticeDate5 = strOrNull(b.defectNoticeDate5);
    updateData.defectConfirmed   = b.defectConfirmed  === true || b.defectConfirmed  === "true";
    updateData.defectConfirmed2  = b.defectConfirmed2  === true || b.defectConfirmed2  === "true";
    updateData.defectConfirmed3  = b.defectConfirmed3  === true || b.defectConfirmed3  === "true";
    updateData.defectConfirmed4  = b.defectConfirmed4  === true || b.defectConfirmed4  === "true";
    updateData.defectConfirmed5  = b.defectConfirmed5  === true || b.defectConfirmed5  === "true";

    const updated = await Research.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Record not found" });

    // Detect if this request was purely an archive/restore toggle
    // (the archive & restore buttons only send {archived, archiveDate, actor_email})
    const isArchiveOnlyAction = b.archived !== undefined &&
      b.researchTitle === undefined && b.referenceId === undefined &&
      b.department === undefined && b.college === undefined &&
      b.authors === undefined && b.status === undefined &&
      b.date === undefined && b.category === undefined &&
      b.googleDriveLink === undefined;

    let logAction = "Update";
    let logDesc   = `Updated details for IP record: "${updated.researchTitle}"`;
    let logSeverity = "warning";

    if (isArchiveOnlyAction) {
      if (b.archived === true || b.archived === "true") {
        logAction = "Archive";
        logDesc   = `Archived IP record: "${updated.researchTitle}" (Ref ID: ${updated.referenceId || 'N/A'})`;
        logSeverity = "warning";
      } else {
        logAction = "Restore";
        logDesc   = `Restored IP record from archive: "${updated.researchTitle}" (Ref ID: ${updated.referenceId || 'N/A'})`;
        logSeverity = "info";
      }
    }

    await createLog({
      user: req.user?.email || req.body.actor_email || "System/Admin",
      action: logAction,
      module: updated.category || "Reports",
      desc: logDesc,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      severity: logSeverity
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE (Magbura ng IP Asset) ───────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const research = await Research.findByIdAndDelete(req.params.id);
    if (!research) return res.status(404).json({ error: "Record not found" });

    await createLog({
      user: req.user?.email || req.query.actor_email || "System/Admin",
      action: "Delete",
      module: research.category || "Reports",
      desc: `Permanently deleted IP record: "${research.researchTitle}" (Ref ID: ${research.referenceId || 'N/A'})`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      severity: "critical" 
    });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT: STATUS UPDATE ONLY ─────────────────────────────────
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Research.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Record not found" });

    await createLog({
      user: req.user?.email || req.body.actor_email || "System/Admin",
      action: "Update",
      module: updated.category || "Reports",
      desc: `Changed status of "${updated.researchTitle}" to: ${status}`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      severity: "info"
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;