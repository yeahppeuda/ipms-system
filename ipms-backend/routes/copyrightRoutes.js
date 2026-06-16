const express = require('express');
const router = express.Router();
const Copyright = require('../models/Copyright');

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