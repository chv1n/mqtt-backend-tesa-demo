
const dotenv = require("dotenv");
dotenv.config();

const { io } = require("socket.io-client");

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
const CAM_COUNT = parseInt(process.env.CAM_COUNT || "2", 10);
const PUB_INTERVAL_MS = parseInt(process.env.PUB_INTERVAL_MS || "2000", 10);
const CENTER_LAT = parseFloat(process.env.CENTER_LAT || "14.30000");
const CENTER_LON = parseFloat(process.env.CENTER_LON || "101.17000");
const SIDE = "def"; // defense side

console.log("🚀 Starting Pi5 Socket.IO Drone Simulator");
console.log("Server:", SERVER_URL);

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const FAKE_IMG = process.env.FAKE_IMG;

// กล้องแต่ละตัว
const cameras = Array.from({ length: CAM_COUNT }, (_, i) => ({
  cam_id: `cam${(i + 1).toString().padStart(3, "0")}`,
  cam_lat: CENTER_LAT + rand(-0.005, 0.005),
  cam_lon: CENTER_LON + rand(-0.005, 0.005),
  cam_bat: Math.floor(rand(85, 100)),
}));

// สร้างโดรนจำลอง (เคลื่อนไหวต่อเนื่อง)
const drones = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  type: pick(["DJIMavic", "DJIAir", "ParrotAnafi", "AutelEvo"]),
  lat: CENTER_LAT + rand(-0.01, 0.01),
  lon: CENTER_LON + rand(-0.01, 0.01),
  velocity: rand(3, 10),
  direction: rand(0, 360),
}));

function moveDrones() {
  drones.forEach((d) => {
    const distance = d.velocity * 0.00005;
    const rad = (d.direction * Math.PI) / 180;
    d.lat += Math.cos(rad) * distance + rand(-0.0001, 0.0001);
    d.lon += Math.sin(rad) * distance + rand(-0.0001, 0.0001);
    d.direction += rand(-8, 8);
    if (d.direction < 0) d.direction += 360;
    if (d.direction > 360) d.direction -= 360;
  });
}

function generatePacket(cam) {
  moveDrones();

  // จำลองว่ากล้องแต่ละตัวเห็นโดรนไม่เท่ากัน
  const visibleCount = Math.floor(rand(1, drones.length));
  const visible = pickMultiple(drones, visibleCount);

  return {
    time: Math.floor(Date.now() / 1000),
    side: SIDE,
    cam_info: [cam],
    object: visible.map((d) => ({
      frame: Math.floor(rand(100, 200)),
      id: d.id,
      type: d.type,
      lat: parseFloat(d.lat.toFixed(5)),
      lon: parseFloat(d.lon.toFixed(5)),
      velocity: parseFloat(d.velocity.toFixed(2)),
      direction: parseFloat(d.direction.toFixed(1)),
      imgbase64: FAKE_IMG,
    })),
  };
}

function pickMultiple(arr, count) {
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

const socket = io(SERVER_URL, {
  transports: ["websocket"],
  reconnection: true,
});

socket.on("connect", () => {
  console.log("✅ Connected to server as Pi:", socket.id);
  sendLoop();
  setInterval(sendLoop, PUB_INTERVAL_MS);
});

socket.on("disconnect", () => console.log("❌ Disconnected"));
socket.on("connect_error", (err) => console.error("⚠️ Connect error:", err.message));

function sendLoop() {
  cameras.forEach((cam) => {
    const packet = generatePacket(cam);
    socket.emit("pi_telemetry", packet);
    console.log(`[SIM WS] ${cam.cam_id} sent ${packet.object.length} drone(s)`);
  });
}
