const { Server } = require("socket.io");
const Drone = require("../models/Drone");
const DroneLog = require("../models/DroneLog");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("[WS] Client connected:", socket.id);

    socket.on("pi_telemetry", async (data) => {
      try {
        const { cam_info, object, side, time } = data;
        const camId = cam_info?.[0]?.cam_id;
        const timestamp = new Date(time * 1000);

        for (const d of object) {
          // 🔹 ตรวจว่ามี drone_id นี้อยู่แล้วหรือยัง
          const existing = await Drone.findOne({ drone_id: d.id });

          if (!existing) {
            console.log(d.imgbase64)
            // 🆕 ครั้งแรก: เก็บข้อมูลพร้อมรูป base64
            const rs = await Drone.create({
              drone_id: d.id,
              type: d.type,
              side,
              first_seen: timestamp,
              first_cam_id: camId,
              image_path: d.imgbase64, // เก็บครั้งแรกเท่านั้น
            });
            console.log(`🆕 New drone detected: ID=${d.id}, saved to DB`, rs);
          }

          // 🟣 เก็บ log ทุกครั้ง
          await DroneLog.create({
            drone_id: d.id,
            timestamp,
            cam_id: camId,
            lat: d.lat,
            lon: d.lon,
            velocity: d.velocity,
            direction: d.direction,
          });
        }

        io.emit("drone_update", data); // ส่งต่อให้ frontend
      } catch (err) {
        console.error("❌ Error handling telemetry:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("[WS] Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = { initSocket };
