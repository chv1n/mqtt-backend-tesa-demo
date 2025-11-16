const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const droneRoutes = require("./routes/drone");
const indexRoutes = require("./routes/index");
const { swaggerUi, specs } = require("./swagger");
const mqttClient = require("./config/mqtt");
const mqttHandler = require("./config/mqttHandler");

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const server = http.createServer(app);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/api", indexRoutes);
app.use("/api/drones", droneRoutes);

// Socket.IO
const io = initSocket(server);

// MQTT → Socket.IO (จุดเชื่อมหลัก)
mqttHandler(mqttClient, io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
