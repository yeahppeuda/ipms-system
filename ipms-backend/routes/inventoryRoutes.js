const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const IoT     = require('../models/Inventory');

// ── Helpers ──────────────────────────────────────────────────────────────────
function validate(body) {
  const errs = [];
  if (!body.name?.trim())        errs.push('Kailangan ng pangalan ng teknolohiya.');
  if (!body.sector)              errs.push('Kailangan piliin ang sektor.');
  if (!body.mode)                errs.push('Kailangan piliin ang transfer mode.');
  if (!body.description?.trim()) errs.push('Kailangan ng deskripsyon.');
  return errs;
}

// Middleware to catch Mongoose specific validation or structural errors
function handleCatchError(e, res) {
  if (e.name === 'ValidationError') {
    const messages = Object.values(e.errors).map(err => err.message);
    return res.status(422).json({ errors: messages });
  }
  res.status(500).json({ error: e.message || 'May panloob na error sa server.' });
}

// ── GET /api/inventory-of-technology ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const data = await IoT.find().sort({ createdAt: -1 }).lean();
    res.json(data);
  } catch (e) { handleCatchError(e, res); }
});

// ── GET /api/inventory-of-technology/:id ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Hindi valid ang ID format.' });
  }
  try {
    const doc = await IoT.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Hindi nahanap ang talaan.' });
    res.json(doc);
  } catch (e) { handleCatchError(e, res); }
});

// ── POST /api/inventory-of-technology ────────────────────────────────────────
router.post('/', async (req, res) => {
  const errs = validate(req.body);
  if (errs.length) return res.status(422).json({ errors: errs });
  
  try {
    const doc = await IoT.create(req.body);
    res.status(201).json(doc);
  } catch (e) { handleCatchError(e, res); }
});

// ── PUT /api/inventory-of-technology/:id ─────────────────────────────────────
router.put('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Hindi valid ang ID format.' });
  }
  
  const errs = validate(req.body);
  if (errs.length) return res.status(422).json({ errors: errs });
  
  try {
    const doc = await IoT.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).lean();
    
    if (!doc) return res.status(404).json({ error: 'Hindi nahanap ang talaan.' });
    res.json(doc);
  } catch (e) { handleCatchError(e, res); }
});

// ── DELETE /api/inventory-of-technology/:id ───────────────────────────────────
router.delete('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Hindi valid ang ID format.' });
  }
  try {
    const doc = await IoT.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Hindi nahanap ang talaan.' });
    res.json({ message: 'Matagumpay na nabura.' });
  } catch (e) { handleCatchError(e, res); }
});

module.exports = router;