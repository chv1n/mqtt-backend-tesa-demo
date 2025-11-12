const mqtt = require("mqtt");

const MQTT_URL = process.env.MQTT_BROKER_URL || "mqtt://broker.emqx.io:1883";
const TOPIC = process.env.MQTT_TOPIC || "tesa/drone_data";

const mqttClient = mqtt.connect(MQTT_URL);

mqttClient.on("connect", () => {
  console.log("[MQTT] Connected to broker:", MQTT_URL);



  mqttClient.subscribe(TOPIC, (err) => {
    if (err) console.error("[MQTT] Subscribe error:", err.message);
    else console.log(`[MQTT] Subscribed to topic: ${TOPIC}`);
  });
});

mqttClient.on("error", (err) => {
  console.error("[MQTT] Error:", err.message);
});

module.exports = mqttClient;
