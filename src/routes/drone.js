/**
 * @swagger
 * tags:
 *   name: Drones
 *   description: Drone tracking and logs
 */

/**
 * @swagger
 * /api/drones:
 *   get:
 *     summary: Get all drones with filter/sort/pagination
 *     tags: [Drones]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by drone type
 *       - in: query
 *         name: side
 *         schema:
 *           type: string
 *           enum: [def, off]
 *         description: Filter by side
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [first_seen, type, first_cam_id]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of drones
 */

/**
 * @swagger
 * /api/drones/{id}:
 *   get:
 *     summary: Get drone by MongoDB _id
 *     tags: [Drones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the drone
 *     responses:
 *       200:
 *         description: Drone details
 *       404:
 *         description: Drone not found
 */

/**
 * @swagger
 * /api/drones/{id}/logs:
 *   get:
 *     summary: Get logs of a specific drone
 *     tags: [Drones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the drone
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [timestamp, velocity, direction]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Drone logs list
 */

const express = require("express");
const router = express.Router();
const droneController = require("../controllers/droneController");

router.get("/", droneController.getAllDrones);
router.get("/:id", droneController.getDroneById);
router.get("/:id/logs", droneController.getDroneLogs);

module.exports = router;
