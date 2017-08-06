var fs = require('fs');
var app = require('express')();
//var https = require('https');
var Logger = require('le_node');
var http = require('http');
var port = process.env.PORT || 3000;
log('attempting to use port:' + port)
var logger = new Logger({  token:'f7347545-b7ff-4682-894f-7473dac2c18c'});

//var privateKey  = fs.readFileSync(__dirname + '/cert/server-key.pem', 'utf8');
//var certificate = fs.readFileSync(__dirname + '/cert/server-cert.pem', 'utf8');
//var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

//var io = require('socket.io')(httpsServer);
var io = require('socket.io')(httpServer);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.set('origins','https://localhost');
io.on('connection', function(socket){
  
  log('a user connected');
  var room;
  
  socket.on('joinroom', function(object) {
      socket.join(object.room);
      socket.username = object.username;
      room = object.room;
      log(socket.username+' joined room:' + room);
      socket.broadcast.to(room).emit('chat message' , {message: socket.username + ' just joined this room', username:'system'});
    });

  socket.on('disconnect', function(){
    log(socket.username + ' disconnected');
    socket.broadcast.to(room).emit('chat message' , {message: peopleInRoom()  + ' people in this room', username:'system'});
  });
  
  socket.on('chat message', function(message){
    log(socket.username + ' is sending message: ' + message + ' to room: ' + room);
    socket.broadcast.to(room).emit('chat message', {message:message, username:socket.username});
  });

  var peopleInRoom = function()
  {
    return  io.sockets.adapter.rooms[room] == undefined ? '0' : io.sockets.adapter.rooms[room].length;
  }

});

//httpsServer.listen(44320,function(){
//  log('listening on Https *:44320')
//})

httpServer.listen(port,function(){
  log('listening on Http *:' + port)
})

var log = function(message)
{
  console.log(message);
  logger.info(message);
}