// models/DroneLog.js
const mongoose = require("mongoose");

const droneLogSchema = new mongoose.Schema({
  drone_id: Number,
  timestamp: Date,
  cam_id: String,
  lat: Number,
  lon: Number,
  velocity: Number,
  direction: Number,
});

module.exports = mongoose.model("DroneLog", droneLogSchema);
