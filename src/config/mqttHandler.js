const Drone = require("../models/Drone");
const DroneLog = require("../models/DroneLog");

module.exports = (mqttClient, io) => {
  mqttClient.on("message", async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("📩 MQTT Message:", data);


      const { timestamp, side, lat, lon, alt } = data;
      const ts = new Date(timestamp * 1000);
      const drone_id = 999; // ตัวอย่าง ถ้า Pi ไม่มี id — ใช้ค่า default หรือ hash ก็ได้
      const drone_type = "MQTT-Drone";

      io.emit("drone_update", data);

      console.log(data.side)
      const rs = await DroneLog.create({
        timestamp: ts,
        drone_id,
        side : data.side,
        lat,
        lon,
      });


    } catch (err) {
      console.error("[MQTT Error]:", err.message);
    }
  });
};
