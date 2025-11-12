const Drone = require("../models/Drone");
const DroneLog = require("../models/DroneLog");

// 🟢 GET /api/drones?filter/sort/pagination (เดิม)
exports.getAllDrones = async (req, res) => {
  try {
    const { type, side, sort = "first_seen", order = "desc", page = 1, limit = 10 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (side) query.side = side;

    const sortOrder = order === "asc" ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const drones = await Drone.find(query)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Drone.countDocuments(query);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: drones,
    });
  } catch (err) {
    console.error("❌ Error fetching drones:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟢 GET /api/drones/:id  (ใช้ MongoDB _id)
exports.getDroneById = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) return res.status(404).json({ error: "Drone not found" });
    res.json(drone);
  } catch (err) {
    console.error("❌ Error fetching drone:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// 🟡 GET /api/drones/:id/logs  (ดึง log ด้วย drone_id)
exports.getDroneLogs = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) return res.status(404).json({ error: "Drone not found" });

    const { sort = "timestamp", order = "desc", limit = 100 } = req.query;
    const sortOrder = order === "asc" ? 1 : -1;

    const logs = await DroneLog.find({ drone_id: drone.drone_id })
      .sort({ [sort]: sortOrder })
      .limit(parseInt(limit));

    res.json({ drone_id: drone.drone_id, total: logs.length, data: logs });
  } catch (err) {
    console.error("❌ Error fetching drone logs:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
