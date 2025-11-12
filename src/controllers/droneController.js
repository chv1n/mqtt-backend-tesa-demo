const Drone = require('../models/Drone');

exports.getAllDrones = async (req, res) => {
  try {
    const drones = await Drone.find().sort({ timestamp: -1 }); 
    res.json(drones);
  } catch (err) {
    console.error(' Error fetching drones:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDroneById = async (req, res) => {
  try {
    const drone = await Drone.findOne({ droneId: req.params.id });
    if (!drone) return res.status(404).json({ error: 'Drone not found' });
    res.json(drone);
  } catch (err) {
    console.error(' Error fetching drone:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createDrone = async (data) => {
  try {
    const drone = new Drone(data);
    const saved = await drone.save();
    console.log(' Drone data saved:', saved);
    return saved;
  } catch (err) {
    console.error(' Error saving drone:', err.message);
    throw err;
  }
};
