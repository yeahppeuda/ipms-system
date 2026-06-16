const express = require('express');
const router = express.Router();
const Calendar = require('../models/Calendar'); // Diretso sa calendar.js, 'Calendar' na rin ang variable

// GET: Kunin lahat ng naka-save na notes
router.get('/', async (req, res) => {
  try {
    const notes = await Calendar.find();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Mag-add o mag-update ng note sa isang araw
router.post('/', async (req, res) => {
  try {
    const { dateKey, date, note } = req.body;
    
    const savedNote = await Calendar.findOneAndUpdate(
      { dateKey },
      { date: date || dateKey, note },
      { new: true, upsert: true }
    );

    res.status(200).json(savedNote);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE: Burahin ang note gamit ang dateKey
router.delete('/:dateKey', async (req, res) => {
  try {
    const deletedNote = await Calendar.findOneAndDelete({ dateKey: req.params.dateKey });
    if (!deletedNote) return res.status(404).json({ message: 'Note not found' });
    
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;