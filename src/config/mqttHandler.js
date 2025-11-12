module.exports = (mqttClient, io) => {
  mqttClient.on("message", (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      io.emit("drone_update", payload);
    } catch (err) {
      console.error("[MQTT Invalid JSON]:", err.message);
    }
  });
};
