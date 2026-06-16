const express = require('express');
const router = express.Router();
const UtilityModel = require('../models/UtilityModel');

router.get('/', async (req, res) => {
  try {
    const data = await UtilityModel.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newItem = new UtilityModel(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;