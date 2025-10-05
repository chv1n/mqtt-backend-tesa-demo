const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const mqttClient = require('./config/mqtt');
const routes = require('./routes');
const drone = require('./routes/drone');
require('dotenv').config();

const app = express();
connectDB();

// สร้าง HTTP server + socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // หรือระบุ "http://localhost:5173"
    methods: ["GET", "POST"]
  }
});

// เมื่อมี client เชื่อมต่อ
io.on('connection', (socket) => {
  console.log('[WS] Client connected:', socket.id);
  socket.on('disconnect', () => console.log('[WS] Client disconnected:', socket.id));
});

// ---- MQTT → Socket.io ----
mqttClient.on('connect', () => {
  console.log('[MQTT] Connected to broker');
  mqttClient.subscribe('tesa/drone_data', (err) => {
    if (err) console.error('[MQTT] Subscribe error:', err);
    else console.log('[MQTT] Subscribed to tesa/drone_data');
  });
});

mqttClient.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    // ✅ ส่งข้อมูลแบบ realtime ไปยัง WS
    io.emit('drone_update', data);

    console.log(`📡 MQTT → WS:`, data);
  } catch (err) {
    console.error('[MQTT] Error parsing message:', err.message);
  }
});

// routes หลัก
app.use('/', routes);
app.use('/api/drones', drone);

// เริ่มเซิร์ฟเวอร์
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 HTTP + WS Server running on port ${port}`);
});
