const mqtt = require('mqtt');
require('dotenv').config({ path: '../../.env' });

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://192.168.1.100:1883';
const CAM_COUNT = parseInt(process.env.CAM_COUNT || '2', 10);
const PUB_INTERVAL_MS = parseInt(process.env.PUB_INTERVAL_MS || '2000', 10);
const BASE_TOPIC = process.env.BASE_TOPIC || 'tesa/drone_data';
const CENTER_LAT = parseFloat(process.env.CENTER_LAT || '13.7563');
const CENTER_LON = parseFloat(process.env.CENTER_LON || '100.5018');

console.log('🚀 Camera Detector Simulator starting...');
console.log('Broker:', MQTT_BROKER_URL);

const rand = (min, max) => Math.random() * (max - min) + min;

// กล้องแต่ละตัว (จำลอง Pi 5)
const cameras = Array.from({ length: CAM_COUNT }, (_, i) => ({
  cam_id: `cam${(i + 1).toString().padStart(3, '0')}`,
  lat: CENTER_LAT + rand(-0.01, 0.01),
  lon: CENTER_LON + rand(-0.01, 0.01)
}));

const client = mqtt.connect(MQTT_BROKER_URL);

client.on('connect', () => {
  console.log(`[SIM MQTT] Connected to ${MQTT_BROKER_URL}`);
  console.log(`[SIM MQTT] Publishing ${CAM_COUNT} camera(s) to topic "${BASE_TOPIC}" every ${PUB_INTERVAL_MS}ms`);
  publishTick();
  setInterval(publishTick, PUB_INTERVAL_MS);
});

client.on('error', err => console.error('[SIM MQTT] MQTT error:', err.message));

// ✅ ส่งข้อมูลตาม payload ใหม่
function publishTick() {
  const now = Math.floor(Date.now() / 1000); // timestamp แบบ UNIX
  cameras.forEach(cam => {
    const message = {
      timestamp: now,
      side: "off", // ฝั่งบุก (off) ตามที่กำหนด
      lat: parseFloat((cam.lat + rand(-0.002, 0.002)).toFixed(6)),
      lon: parseFloat((cam.lon + rand(-0.002, 0.002)).toFixed(6)),
      alt: parseFloat(rand(0, 1).toFixed(6)) // ค่าจำลอง
    };

    const payload = JSON.stringify(message);
    client.publish(BASE_TOPIC, payload, { qos: 0 });
    console.log(`[SIM MQTT] ${payload}`);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
function shutdown() {
  console.log('\n[SIM MQTT] Shutting down...');
  try {
    client.end(true, () => process.exit(0));
  } catch (_) {
    process.exit(0);
  }
}
