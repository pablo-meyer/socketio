var config = require('../config/config');
var logger = require('../services/logger');
var socket =
    {
        init: function (app,httpServer) {
            var io = require('socket.io')(httpServer);
            io.set('origins', config.socketAllowedOrigins);
            io.on('connection', function (socket) {

                logger.log('a user connected');
                var room;

                socket.on('joinroom', function (object) {
                    socket.join(object.room);
                    socket.username = object.username;
                    room = object.room;
                    logger.log(socket.username + ' joined room:' + room);
                    socket.broadcast.to(room).emit('chat message', { message: socket.username + ' just joined this room', username: 'system' });
                });

                socket.on('disconnect', function () {
                    logger.log(socket.username + ' disconnected');
                    socket.broadcast.to(room).emit('chat message', { message: peopleInRoom() + ' people in this room', username: 'system' });
                });

                socket.on('chat message', function (message) {
                    logger.log(socket.username + ' is sending message: ' + message + ' to room: ' + room);
                    socket.broadcast.to(room).emit('chat message', { message: message, username: socket.username });
                });

                var peopleInRoom = function () {
                    return io.sockets.adapter.rooms[room] == undefined ? '0' : io.sockets.adapter.rooms[room].length;
                }

            });
        }
    }
module.exports = socket;