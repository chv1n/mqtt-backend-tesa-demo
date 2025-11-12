// swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const dotenv = require("dotenv");
dotenv.config();


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Drone Tracking API",
      version: "1.0.0",
      description: "API documentation for Drone Tracking System (Socket.IO + MongoDB)",
    },
    servers: [
      {
        url: `${process.env.SERVER_HOST}:${process.env.PORT || 3000}`,
      },
    ],
  },
  apis: ["./src/routes/*.js"],
  // 👈 ให้ Swagger ไปอ่าน doc จาก comment ใน routes
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
