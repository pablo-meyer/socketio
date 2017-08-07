var fs = require('fs');
var app = require('express')();
var http = require('http');
var logger = require('./services/logger');
var config = require('./config/config');
var controllers = require('./controllers');

var port = process.env.PORT || 3000;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var httpServer = http.createServer(app);

var io = require('socket.io')(httpServer);
controllers.init(app);

io.set('origins',config.socketAllowedOrigins);
io.on('connection', function(socket){
  
  logger.log('a user connected');
  var room;
  
  socket.on('joinroom', function(object) {
      socket.join(object.room);
      socket.username = object.username;
      room = object.room;
      logger.log(socket.username+' joined room:' + room);
      socket.broadcast.to(room).emit('chat message' , {message: socket.username + ' just joined this room', username:'system'});
    });

  socket.on('disconnect', function(){
    logger.log(socket.username + ' disconnected');
    socket.broadcast.to(room).emit('chat message' , {message: peopleInRoom()  + ' people in this room', username:'system'});
  });
  
  socket.on('chat message', function(message){
    logger.log(socket.username + ' is sending message: ' + message + ' to room: ' + room);
    socket.broadcast.to(room).emit('chat message', {message:message, username:socket.username});
  });

  var peopleInRoom = function()
  {
    return  io.sockets.adapter.rooms[room] == undefined ? '0' : io.sockets.adapter.rooms[room].length;
  }

});

httpServer.listen(port,function(){
  logger.log('listening on Http *:' + port)
})

