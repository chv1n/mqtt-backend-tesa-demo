const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send(' MQTT → Express → MongoDB is working!');
});


module.exports = router;
