const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { createLog } = require('../utils/logger');

router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Mag-save ng bagong event
router.post('/', async (req, res) => {
  const { actor_email, ...eventData } = req.body;
  const event = new Event(eventData);
  try {
    const savedEvent = await event.save();

    await createLog({
      user: req.user?.email || actor_email || "System/Admin",
      action: "Create",
      module: "Events",
      desc: `Created new event: "${savedEvent.name}"`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      severity: "info"
    });

    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT: I-update ang event
router.put('/:id', async (req, res) => {
  try {
    const { actor_email, ...eventData } = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, eventData, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: "Event not found" });

    await createLog({
      user: req.user?.email || actor_email || "System/Admin",
      action: "Update",
      module: "Events",
      desc: `Updated details for event: "${updatedEvent.name}"`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      severity: "warning"
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Burahin ang event
router.delete('/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ message: "Event not found" });

    await createLog({
      user: req.user?.email || req.query.actor_email || "System/Admin",
      action: "Delete",
      module: "Events",
      desc: `Permanently deleted event: "${deletedEvent.name}"`,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      severity: "critical"
    });

    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;