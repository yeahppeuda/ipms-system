const express = require('express');
const router = express.Router();
const Copyright = require('../models/Copyright');
const { createLog } = require('../utils/logger');

// GET ALL
router.get('/', async (req, res) => {
  try {
    const data = await Copyright.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST (optional for add research)
router.post('/', async (req, res) => {
  try {
    const newItem = new Copyright(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Copyright.findByIdAndUpdate(req.params.id, { status }, { new: true });

    // Eto ang mag-a-activate ng logs
    await createLog({
      user: "Admin",
      action: "Update",
      module: "Copyright",
      desc: `Binago ang status sa: ${status}`,
      ip: req.ip,
      severity: "info"
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});