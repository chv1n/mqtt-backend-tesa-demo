const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const mqttClient = require("./config/mqtt");
const { initSocket } = require("./config/socket");
const routes = require("./routes");
const drone = require("./routes/drone");
const mqttHandler = require("./config/mqttHandler");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ เริ่ม socket.io แยกไฟล์
const io = initSocket(server);



mqttHandler(mqttClient, io);

app.use("/api", routes);
app.use("/drone", drone);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
