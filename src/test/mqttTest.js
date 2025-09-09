const mqtt = require('mqtt');
require('dotenv').config();

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const mqttClient = mqtt.connect(MQTT_BROKER_URL);

const topic = 'drone/status';
let lastMessageTime = null;
const checkInterval = 1000 * 10; 

mqttClient.on('connect', () => {
  console.log(' Connected to MQTT broker');
  
  mqttClient.subscribe(topic, (err) => {
    if (err) console.error(' Subscribe error:', err);
    else console.log(`Subscribed to topic: ${topic}`);
  });
});

mqttClient.on('message', (topic, message) => {
  const now = new Date();
  lastMessageTime = now;

  console.log(` Message received at ${now.toISOString()}: ${message.toString()}`);
});

setInterval(() => {
  const now = new Date();
  if (!lastMessageTime) {
    console.log(' No message received yet');
    return;
  }

  const diff = (now - lastMessageTime) / 1000; 
  if (diff > 70) { 
    console.log(` Warning! Last message received ${diff.toFixed(1)}s ago`);
  } else {
    console.log(` Last message received ${diff.toFixed(1)}s ago`);
  }
}, checkInterval);
