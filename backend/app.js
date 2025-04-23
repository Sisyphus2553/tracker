// index.js (Backend)
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketio = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "http://localhost:5173", // React frontend origin
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send("hello");
});

io.on('connection', (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("send-Location", (data) => {
    io.emit("receive-Location", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    io.emit("user-disconnected", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
