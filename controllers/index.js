"use strict";
var config = require('../config/config');
var logger = require('../services/logger');
var rooms = require('../services/rooms');
var util = require('util');

var controllers =
  {
    init: function (app) {
      app.get('/', function (req, res) {
        var model = { socketUrl: config.socketUrl, secureSocket: config.secureSocket };
        res.render('../views/home/index', { model });
      });
      app.get('/token/:context/:userName', function (request, response) {
        var identity = request.params.userName
        var roomName = request.params.context;
        rooms.createRoom(roomName).then((roomId) => {
          //we created the room, lets send the token
          logger.log(`Room successfully created Name: ${roomName} Id: ${roomId}`);
          return response.send({ token: rooms.getToken(identity, roomName) });
        }).catch((err) => {
          if (err.code === 53113) {
            //unable to create room as it already exists
            logger.log('Unable to create room, it already exists');
            return response.send({ token: rooms.getToken(identity, roomName) });
          }
          else {
            logger.log(err);
            throw new Error(err.message);
          }

        });
      });
      //http://localhost:3000/room/{roomName}}
      app.get('/room/:context', function (request, response) {
        var roomName = request.params.context;
        rooms.getRoomInfo(roomName).then((room) => {           
          return response.send({ room: util.inspect(room) });
        });
      });

      //http://localhost:3000/rooms/completed
      //http://localhost:3000/rooms/in-progress
       app.get('/rooms/:status', function (request, response) {
        var status = request.params.status;
        rooms.getRooms(status).then((rooms) => {           
          return response.send({ rooms: rooms.map((item) => {return { sid: item.sid, status: item.status, enableTurn: item.enableTurn, uniqueName: item.uniqueName, duration: item.duration };}) });
        });
      });
      //http://localhost:3000/recordings/RM791ac7c79fe2c75ac78d8b90437288da
       app.get('/recordings/:roomId', function (request, response) {
        var roomId = request.params.roomId;
        rooms.getRecordings(roomId).then((recordings) => {      
          return response.send({ rooms: recordings.map((item) => {return { sid: item.sid, status: item.status, type: item.type, size: item.size, duration: item.duration, containerFormat: item.containerFormat };}) });
        });
      });
      app.get('/media/:roomId/:recordingId', function(request, response){
        var recordingId = request.params.recordingId;
        var roomId = request.params.roomId;
        var media = rooms.getRecordingMedia(recordingId).then((mediaLocation) => {
          return response.send({ mediaLocation: mediaLocation });
        });        
      });
    }
  }
module.exports = controllers;