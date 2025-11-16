
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
        console.log("data in from pi", data)

        for (const d of object) {
          const existing = await Drone.findOne({ drone_id: d.id });

          if (!existing) {
            await Drone.create({
              drone_id: d.id,
              type: d.type,
              side,
              first_seen: timestamp,
              first_cam_id: camId,
              image_path: d.imgbase64,
            });
            console.log(`🆕 New drone detected: ID=${d.id}`);
          }

          await DroneLog.create({
            timestamp,
            drone_id: d.id,
            side: "def",
            cam_id: camId,
            drone_type: d.type,
            lat: d.lat,
            lon: d.lon,
            velocity: d.velocity,
            direction: d.direction,
          });
        }

        io.emit("drone_update", data);
      } catch (err) {
        console.error("❌ Error handling telemetry:", err.message);
      }
    });

    socket.on("pi_stream", (frame) => {
      try {
        const { cam_id, drone_id, time, imgbase64 } = frame;

        io.emit("drone_frame", {
          cam_id,
          drone_id,
          time,
          imgbase64,
        });

        console.log(`[STREAM] ${cam_id} -> Drone ${drone_id} (${new Date(time * 1000).toISOString()})`);
      } catch (err) {
        console.error("❌ Error handling pi_stream:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("[WS] Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = { initSocket };
