const express = require('express');
const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');
const mysql = require('mysql');

const app = express();
const server =http.createServer(app);

var client = mysql.createConnection({
  user:'root',
  password:123,
  database:'Location'
});

app.get('/tracker',(request,response)=>{
  fs.readFile('Tracker.html',(error,data)=>{
    if(error){
      console.log('tracker page error: '+error);
    }else{
      response.send(data.toString());
    }
  });
});
app.get('/observer',(request,response)=>{
  fs.readFile('Observer.html',(error,data)=>{
    if(error){
      console.log('observer page error: '+error);
    }else{
      response.send(data.toString());
    }
  });
});
app.get('/showdata',(request,response)=>{
  client.query('select * from locations where name=?',[
    request.params.name
  ],(error,data)=>{
    if(error){
      console.log('showdata page error: '+error);
    }else{
      response.send(data);
    }
  });
});
server.listen(10116,()=>{
  console.log('on the server ...');
});
const io = socketio.listen(server);

io.sockets.on('connection',(socket)=>{
  socket.on('join',(data)=>{
    socket.join(data);
  });
  socket.on('location',(data)=>{
    client.query('INSERT INTO locations (name,latitude,longitude,date) VALUES (?,?,?,NOW())',
  [
    data.name,
    data.latitude,
    data.longitude,
  ]);
  io.sockets.in(data.name).emit('receive',{
    latitude:data.latitude,
    longitude:data.longitude,
    date:Date.now()
  });
  });
});
