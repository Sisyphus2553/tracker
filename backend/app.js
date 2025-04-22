const express = require('express');
const app = express();
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const server = http.createServer(app);  


app.get('/',(req,res)=>{
    res.send("hello");
}); 

const io = socketio(server);
io.on('connection',(socket)=>{
   socket.on("send-Location",(data)=>{
    io.emit("receive-Location",{id: socket.id,...data});
   })
   socket.on('disconnect',()=>{
       io.emit("user-disconnected",socket.id);
    })
});

server.listen(3000,()=>{
    console.log("server is running on port 3000");
});