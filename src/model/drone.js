const mongoose = require('mongoose');

const droneSchema = new mongoose.Schema({
    isDrone: { type: Boolean, },
    time: { type: Date, },
    droneId: { type: String, },
    lat: { type: Number },
    long: { type: Number, },
    altitude: { type: Number },
    receivedAt: { type: Date, default: Date.now }
});


const Drone = mongoose.model('Drone', droneSchema, 'drone');

module.exports = Drone;
