// server.js
const express = require('express');
const connectDB = require('./config/db');
const mqttClient = require('./config/mqtt');
const routes = require('./routes');
const drone = require('./routes/drone');

require('dotenv').config();


const app = express();

connectDB();

app.use('/', routes);
app.use('/api/drones', drone);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
