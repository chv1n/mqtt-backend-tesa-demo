const mqtt = require('mqtt');
require('dotenv').config({ path: '../../.env' });


const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://broker.emqx.io:1883';
const CAM_COUNT = parseInt(process.env.CAM_COUNT || '2', 10);
const PUB_INTERVAL_MS = parseInt(process.env.PUB_INTERVAL_MS || '2000', 10);
const BASE_TOPIC = process.env.BASE_TOPIC || 'camera/detections';
const CENTER_LAT = parseFloat(process.env.CENTER_LAT || '13.7563');
const CENTER_LONG = parseFloat(process.env.CENTER_LONG || '100.5018');

console.log('🚀 Camera Detector Simulator starting...');
console.log('Broker:', MQTT_BROKER_URL);

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// กล้องแต่ละตัว (จำลอง Pi 5)
const cameras = Array.from({ length: CAM_COUNT }, (_, i) => ({
  cam_id: `cam${(i + 1).toString().padStart(3, '0')}`,
  lat: CENTER_LAT + rand(-0.01, 0.01),
  lon: CENTER_LONG + rand(-0.01, 0.01)
}));

// สร้างข้อมูล object ตรวจจับ
function generateObjects() {
  const num = Math.floor(rand(1, 5)); // ตรวจจับได้ 1-5 ลำ
  const objects = [];

  for (let i = 0; i < num; i++) {
    objects.push({
      frame: Math.floor(rand(100, 200)),      // frame index
      id: i,
      type: pick(['DJIMavic', 'DJIAir', 'ParrotAnafi', 'AutelEvo']),
      lat: parseFloat((CENTER_LAT + rand(-0.01, 0.01)).toFixed(5)),
      lon: parseFloat((CENTER_LONG + rand(-0.01, 0.01)).toFixed(5)),
      velocity: parseFloat(rand(0, 15).toFixed(2)), // m/s
      direction: parseFloat(rand(0, 360).toFixed(1)) // degrees
    });
  }
  return objects;
}

const client = mqtt.connect(MQTT_BROKER_URL);

client.on('connect', () => {
  console.log(`[SIM] Connected to ${MQTT_BROKER_URL}`);
  console.log(`[SIM] Publishing ${CAM_COUNT} camera(s) to topic "${BASE_TOPIC}" every ${PUB_INTERVAL_MS}ms`);
  publishTick();
  setInterval(publishTick, PUB_INTERVAL_MS);
});

client.on('error', err => console.error('[SIM] MQTT error:', err.message));

function publishTick() {
  const now = Math.floor(Date.now() / 1000); // Unix time
  cameras.forEach(cam => {
    const message = {
      time: now,
      cam_id: cam.cam_id,
      object: generateObjects()
    };
    const payload = JSON.stringify(message);
    client.publish(BASE_TOPIC, payload, { qos: 0 });
    console.log(`[SIM] ${cam.cam_id} -> ${payload}`);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
function shutdown() {
  console.log('\n[SIM] Shutting down...');
  try {
    client.end(true, () => process.exit(0));
  } catch (_) {
    process.exit(0);
  }
}
