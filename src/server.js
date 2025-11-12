const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const droneRoutes = require("./routes/drone");
const indexRoutes = require("./routes/index");
const { swaggerUi, specs } = require("./swagger"); // ✅ เพิ่มบรรทัดนี้

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// ✅ Routes
app.use("/api", indexRoutes);
app.use("/api/drones", droneRoutes);

// ✅ Socket
initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
