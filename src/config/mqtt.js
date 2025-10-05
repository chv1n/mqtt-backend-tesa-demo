// mqtt.js (ไฟล์ของคุณ)
const mqtt = require('mqtt');
const Drone = require('../model/drone');
require('dotenv').config();

const { io } = require('./socket');  

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const mqttClient = mqtt.connect(MQTT_BROKER_URL);

mqttClient.on('connect', () => {
  console.log(' Connected to MQTT broker', MQTT_BROKER_URL);
  mqttClient.subscribe('drone/status', (err) => {
    if (err) console.error(' Subscribe error:', err);
    else console.log(' Subscribed to topic: drone/status');
  });
});

mqttClient.on('message', async (topic, message) => {
  console.log(`Message received from topic ${topic}: ${message.toString()}`);
  try {
    const data = JSON.parse(message.toString());
    // บันทึกลง DB ตามเดิม...
    io.emit('drone_update', data); // <--- ส่งต่อไปหน้าเว็บแบบ realtime
  } catch (err) {
    console.error('Error parsing message:', err.message);
  }
});

module.exports = mqttClient;
