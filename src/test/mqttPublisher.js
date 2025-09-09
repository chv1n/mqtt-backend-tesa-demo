const mqtt = require('mqtt')
require('dotenv').config();

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const mqttClient = mqtt.connect(MQTT_BROKER_URL)
const topic = 'drone/status'


console.log("MQTT Publisher Testing...")
setInterval(() => {
    try {
        const droneData = {
            droneId: "Drone01",
            isDrone: true,
            time: new Date().toISOString(),
            Lat: 13.7563,
            Long: 100.3745,
            altitude: 120
        }

        const droneDataJson = JSON.stringify(droneData)
        mqttClient.publish(topic, droneDataJson, () => {
            console.log(`Sent data : ${droneDataJson} to ${topic}`)
        })
    }catch(e){
        console.error(e)
    }
}, 10 * 1000)
