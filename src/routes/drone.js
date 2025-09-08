const express = require('express');
const router = express.Router();
const Drone = require('../model/drone');

router.get('/', async (req, res) => {
  try {
    const drones = await Drone.find().sort({ timestamp: -1 }); 
    res.json(drones);
  } catch (err) {
    console.error(' Error fetching drones:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const drone = await Drone.findOne({ droneId: req.params.id });
    if (!drone) return res.status(404).json({ error: 'Drone not found' });
    res.json(drone);
  } catch (err) {
    console.error(' Error fetching drone:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
