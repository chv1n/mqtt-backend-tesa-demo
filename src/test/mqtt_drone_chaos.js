/**
 * MQTT Drone Chaos Tests (edge cases & validation)
 * Usage:
 *  1) .env with MQTT_BROKER_URL=...
 *  2) node mqtt_drone_chaos.js
 * Notes:
 *  - Publishes a sequence of problematic payloads to help you test parser/DB/WS paths.
 */
const mqtt = require('mqtt');
require('dotenv').config();

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const TOPIC = process.env.BASE_TOPIC || 'drone/status';
const client = mqtt.connect(MQTT_BROKER_URL);

const wait = (ms) => new Promise(res => setTimeout(res, ms));
const send = (msg) => new Promise((res) => {
  const payload = typeof msg === 'string' ? msg : JSON.stringify(msg);
  client.publish(TOPIC, payload, { qos: 0 }, () => {
    console.log(`[CHAOS] sent -> ${payload}`);
    res();
  });
});

client.on('connect', async () => {
  console.log(`[CHAOS] Connected to ${MQTT_BROKER_URL}, topic "${TOPIC}"`);

  // 1) Good message (baseline)
  await send({
    isDrone: true, time: new Date().toISOString(), droneId: 'Drone88',
    Lat: 13.7432, Long: 100.5252, altitude: 520
  });
  await wait(1000);

  // 2) Non-drone message (should be ignored by your pipeline)
  await send({
    isDrone: false, time: new Date().toISOString(), droneId: 'X-Device',
    Lat: 13.75, Long: 100.52, altitude: 10
  });
  await wait(1000);

  // 3) Missing fields (no Lat)
  await send({
    isDrone: true, time: new Date().toISOString(), droneId: 'Drone01',
    Long: 100.5018, altitude: 100
  });
  await wait(1000);

  // 4) Wrong types (altitude as string)
  await send({
    isDrone: true, time: new Date().toISOString(), droneId: 'Drone02',
    Lat: 13.75, Long: 100.50, altitude: "120"
  });
  await wait(1000);

  // 5) Malformed JSON (not a JSON string)
  client.publish(TOPIC, '<<this is not JSON>>', {}, () => {
    console.log('[CHAOS] sent -> <<this is not JSON>>');
  });
  await wait(1000);

  // 6) Out-of-range Lat/Long
  await send({
    isDrone: true, time: new Date().toISOString(), droneId: 'Drone03',
    Lat: 200, Long: 500, altitude: 50
  });
  await wait(1000);

  // 7) Very high altitude
  await send({
    isDrone: true, time: new Date().toISOString(), droneId: 'Drone04',
    Lat: 13.751, Long: 100.503, altitude: 10000
  });
  await wait(1000);

  // 8) Old timestamp
  await send({
    isDrone: true, time: '2020-01-01T00:00:00.000Z', droneId: 'Drone05',
    Lat: 13.753, Long: 100.507, altitude: 90
  });
  await wait(1000);

  // 9) Burst of valid messages (10 msgs quickly)
  for (let i = 0; i < 10; i++) {
    await send({
      isDrone: true, time: new Date().toISOString(), droneId: 'Drone-Burst',
      Lat: 13.750 + (Math.random()-0.5)*0.002,
      Long: 100.505 + (Math.random()-0.5)*0.002,
      altitude: 80 + Math.floor(Math.random()*10)
    });
    await wait(50);
  }

  // 10) Empty/near-empty object
  await send({});
  await wait(500);

  console.log('[CHAOS] done. Closing.');
  client.end(true, () => process.exit(0));
});

client.on('error', (e) => {
  console.error('[CHAOS] mqtt error:', e?.message || e);
});
