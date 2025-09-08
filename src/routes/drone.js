const express = require('express');
const router = express.Router();
const droneController = require('../controllers/droneController');

router.get('/', droneController.getAllDrones);

router.get('/:id', droneController.getDroneById);

module.exports = router;
