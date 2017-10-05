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
      app.get('/room/:context', function (request, response) {
        var roomName = request.params.context;
        rooms.getRoomInfo(roomName).then((room) => {           
          return response.send({ room: util.inspect(room) });
        });
      });
    }
  }
module.exports = controllers;