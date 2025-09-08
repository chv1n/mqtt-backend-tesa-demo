const mqtt = require('mqtt');
const Drone = require('../model/drone');
require('dotenv').config();

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const mqttClient = mqtt.connect(MQTT_BROKER_URL);

mqttClient.on('connect', () => {
  console.log(' Connected to MQTT broker');

  mqttClient.subscribe('drone/status', (err) => {
    if (err) console.error(' Subscribe error:', err);
    else console.log(' Subscribed to topic: drone/status');
  });
});

mqttClient.on('message', async (topic, message) => {
  console.log(` Message received from topic ${topic}: ${message.toString()}`);

  try {
    const data = JSON.parse(message.toString());

    const drone = new Drone({
      isDrone: data.isDrone,
      time: data.time,
      droneId: data.droneId,
      lat: data.Lat,
      long: data.Long,
      altitude: data.altitude
    });

    const saved = await drone.save();
    console.log(' Drone data saved:', saved);
  } catch (err) {
    console.error(' Error parsing/saving message:', err.message);
  }
});

module.exports = mqttClient;
