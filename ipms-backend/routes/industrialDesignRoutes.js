const express = require('express');
const router = express.Router();
const IndustrialDesign = require('../models/IndustrialDesign');
const { createLog } = require('../utils/logger');

router.get('/', async (req, res) => {
  try {
    const data = await IndustrialDesign.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newItem = new IndustrialDesign(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;