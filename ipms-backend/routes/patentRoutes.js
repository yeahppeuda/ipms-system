const express = require('express');
const router = express.Router();
const Patent = require('../models/Patent');
const { createLog } = require('../utils/logger');

/* GET ALL */
router.get('/', async (req, res) => {
  try {
    const data = await Patent.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* CREATE */
router.post('/', async (req, res) => {
  try {
    const newItem = new Patent(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;