const mongoose = require("mongoose");

const droneSchema = new mongoose.Schema({
  drone_id: Number,
  type: String,
  first_seen: Date,
  first_cam_id: String,
  image_path: String,
  side: String,
});

module.exports = mongoose.model("Drone", droneSchema);
