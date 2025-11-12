/**
 * MQTT Drone Simulator (realistic multi-drone)
 * Usage:
 *  1) Create .env with MQTT_BROKER_URL=mqtt://localhost:1883
 *  2) node mqtt_drone_sim.js
 * Optional env:
 *  DRONE_COUNT=5
 *  PUB_INTERVAL_MS=1000
 *  BASE_TOPIC=drone/status
 *  CENTER_LAT=13.7563
 *  CENTER_LONG=100.5018
 *  MAX_SPEED_MS=20
 *  QOS=0
 */
const mqtt = require('mqtt');
require('dotenv').config({path: '../../.env' });

console.log('Loaded .env:', process.env.MQTT_BROKER_URL);


const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || "mqtt://broker.emqx.io:1883";
console.log('🚀 Simulator starting...');
const mqttClient = mqtt.connect(MQTT_BROKER_URL);

mqttClient.on('connect', () => {
  console.log('[SIM] Connected to MQTT broker', MQTT_BROKER_URL);
});
// ---- Config from env ----
// const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const DRONE_COUNT = parseInt(process.env.DRONE_COUNT || '3', 10);
const PUB_INTERVAL_MS = parseInt(process.env.PUB_INTERVAL_MS || '1000', 10);
const BASE_TOPIC = process.env.BASE_TOPIC || 'drone/status';
const CENTER_LAT = parseFloat(process.env.CENTER_LAT || '13.7563');   // Bangkok
const CENTER_LONG = parseFloat(process.env.CENTER_LONG || '100.5018');
const MAX_SPEED_MS = parseFloat(process.env.MAX_SPEED_MS || '20');    // m/s (~72 km/h)
const QOS = parseInt(process.env.QOS || '0', 10);

// ---- Helpers ----
const rand = (min, max) => Math.random() * (max - min) + min;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const deg2rad = d => d * Math.PI / 180;

// 1 deg latitude ~ 111,111 m; longitude depends on latitude
const M_PER_DEG_LAT = 111111;

class DroneSim {
  constructor(id, lat, lon) {
    this.id = id;
    this.lat = lat;
    this.lon = lon;
    this.alt = rand(50, 120); // meters
    this.bearingDeg = rand(0, 360);
    this.speedMs = rand(0, MAX_SPEED_MS); // m/s
    this.nextCourseChangeAt = Date.now() + rand(10_000, 30_000);
    this.hoverProb = 0.15; // probability to briefly hover
    this.altBias = rand(-0.3, 0.5); // climb/descend tendency
  }

  step(dtMs) {
    const dt = dtMs / 1000;

    // Occasionally hover
    if (Math.random() < this.hoverProb * dt) {
      this.speedMs = clamp(this.speedMs * rand(0.1, 0.4), 0, MAX_SPEED_MS);
    } else if (Date.now() > this.nextCourseChangeAt) {
      // change course/speed every 10-30s
      this.bearingDeg = (this.bearingDeg + rand(-45, 45) + 360) % 360;
      this.speedMs = clamp(this.speedMs + rand(-3, 5), 0, MAX_SPEED_MS);
      this.nextCourseChangeAt = Date.now() + rand(10_000, 30_000);
    }

    // Convert movement to lat/long deltas
    const bearingRad = deg2rad(this.bearingDeg);
    const dx = Math.cos(bearingRad) * this.speedMs * dt; // meters east
    const dy = Math.sin(bearingRad) * this.speedMs * dt; // meters north
    const mPerDegLon = M_PER_DEG_LAT * Math.cos(deg2rad(this.lat));

    this.lon += dx / mPerDegLon;
    this.lat += dy / M_PER_DEG_LAT;

    // Add small GPS noise
    this.lon += rand(-0.000002, 0.000002);
    this.lat += rand(-0.000002, 0.000002);

    // Altitude random walk with slight bias
    this.alt = clamp(this.alt + this.altBias + rand(-0.6, 0.8), 0, 1500);
  }

  toMessage() {
    return {
      isDrone: true,
      time: new Date().toISOString(),
      droneId: this.id,
      Lat: parseFloat(this.lat.toFixed(6)),
      Long: parseFloat(this.lon.toFixed(6)),
      altitude: Math.round(this.alt)
    };
  }
}

// ---- Create drones around the center point ----
const drones = Array.from({ length: DRONE_COUNT }, (_, i) => {
  const jitterLat = rand(-0.02, 0.02);   // ~2km box
  const jitterLon = rand(-0.02, 0.02);
  return new DroneSim(`Drone${(i+1).toString().padStart(2,'0')}`, CENTER_LAT + jitterLat, CENTER_LONG + jitterLon);
});

// ---- Connect MQTT ----
const client = mqtt.connect(MQTT_BROKER_URL);
client.on('connect', () => {
  console.log(`[SIM] Connected to ${MQTT_BROKER_URL} — publishing ${DRONE_COUNT} drone(s) to "${BASE_TOPIC}" every ${PUB_INTERVAL_MS}ms (QoS ${QOS})`);
  // publish immediately once connected
  publishTick();
  setInterval(publishTick, PUB_INTERVAL_MS);
});

client.on('error', (err) => {
  console.error('[SIM] MQTT error:', err?.message || err);
});

let lastTick = Date.now();
function publishTick() {
  const now = Date.now();
  const dtMs = now - lastTick;
  lastTick = now;

  drones.forEach(d => {
    d.step(dtMs);

    // 2% chance to briefly mark isDrone=false to test filtering logic
    const msg = d.toMessage();
    if (Math.random() < 0.02) {
      msg.isDrone = false;
    }

    const payload = JSON.stringify(msg);
    client.publish(BASE_TOPIC, payload, { qos: QOS }, (err) => {
      if (!err) {
        console.log(`[SIM] ${msg.droneId} -> ${payload}`);
      } else {
        console.error(`[SIM] publish error for ${msg.droneId}:`, err.message);
      }
    });
  });
}

// Graceful shutdown
function shutdown() {
  console.log('\n[SIM] shutting down...');
  try { client.end(true, () => process.exit(0)); } catch (_) { process.exit(0); }
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
