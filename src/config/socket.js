const { Server } = require("socket.io");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("[WS] Client connected:", socket.id);

    io.emit("server_message", {
      type: "info",
      text: `🟢 A new client connected: ${socket.id}`,
    });

    socket.on("drone_update", (data) => {
      console.log("📡 Drone data received:", data);
    });

    socket.on("pi_telemetry", (data) => {
      console.log("📦 [Pi] telemetry received from", data);
      io.emit("drone_update", data); // ส่งต่อให้ web frontend
    });

    socket.on("disconnect", () => {
      console.log("[WS] Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = { initSocket };
