const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: ["http://localhost:3000", "http://localhost:5173"], methods: ["GET","POST"] }
});

io.on('connection', (socket) => {
  console.log('WS connected', socket.id);

  socket.on('follow-drone', (droneId) => socket.join(`drone:${droneId}`));
  socket.on('unfollow-drone', (droneId) => socket.leave(`drone:${droneId}`));
});

module.exports = { io, server, app };
