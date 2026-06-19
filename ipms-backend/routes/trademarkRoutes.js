const express = require('express');
const router = express.Router();
const Trademark = require('../models/Trademark');
const { createLog } = require('../utils/logger');

router.get('/', async (req, res) => {
  try {
    const data = await Trademark.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newItem = new Trademark(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;