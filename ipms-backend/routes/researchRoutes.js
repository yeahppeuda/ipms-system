const express  = require("express");
const router   = express.Router();
const Research = require("../models/Research");

// ── CREATE ──────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const research = new Research(req.body);
    await research.save();
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

// ── UPDATE ──────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const b = req.body;

    // helper: treat empty string / undefined / null all as null
    const strOrNull = (v) => (v && v.toString().trim() !== "" ? v.toString().trim() : null);

    const updateData = {};

    if (b.researchTitle  !== undefined) updateData.researchTitle  = b.researchTitle;
    if (b.referenceId    !== undefined) updateData.referenceId    = b.referenceId;
    if (b.department     !== undefined) updateData.department     = b.department;
    if (b.authors        !== undefined) updateData.authors        = b.authors;
    if (b.status         !== undefined) updateData.status         = b.status;
    if (b.date           !== undefined) updateData.date           = b.date;
    if (b.category       !== undefined) updateData.category       = b.category;

    // Always write defect fields explicitly — null means "no defect", string means date
    updateData.defectNoticeDate  = strOrNull(b.defectNoticeDate);
    updateData.defectNoticeDate2 = strOrNull(b.defectNoticeDate2);
    updateData.defectConfirmed1  = b.defectConfirmed1  === true || b.defectConfirmed1  === "true";
    updateData.defectConfirmed2  = b.defectConfirmed2  === true || b.defectConfirmed2  === "true";

    const updated = await Research.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Record not found" });

    console.log("✅ Saved:", updated._id.toString(), {
      defectNoticeDate:  updated.defectNoticeDate,
      defectNoticeDate2: updated.defectNoticeDate2,
      defectConfirmed1:  updated.defectConfirmed1,
      defectConfirmed2:  updated.defectConfirmed2,
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE ──────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await Research.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;