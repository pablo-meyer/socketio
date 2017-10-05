"use strict";
var config = require('../config/config');
var logger = require('../services/logger');
var AccessToken = require('twilio').jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;
var Twilio = require('twilio');
var controllers =
  {
    init: function (app) {
      app.get('/', function (req, res) {
        var model = { socketUrl: config.socketUrl, secureSocket: config.secureSocket };
        res.render('../views/home/index', { model });
      });
      app.get('/token/:context/:userName', function (request, response) {
        var identity = request.params.userName
        var context = request.params.context;
        logger.log(`Getting twillio token for UserName: ${identity} Context:${context}`);
        var token;

        var client = new Twilio(config.twillio.apiKey, config.twillio.apiSecret, { accountSid: config.twillio.accountId });
        client.video.rooms.create({
          uniqueName: context,
          type: 'group',
          recordParticipantsOnConnect: 'true'
        }).then((room) => {
          console.log(room);
          token = new AccessToken(
            config.twillio.accountId,
            config.twillio.apiKey,
            config.twillio.apiSecret
          );
          // Assign the generated identity to the token.
          token.identity = identity;
          var grant = new VideoGrant();
          token.addGrant(grant);
          // Serialize the token to a JWT string and include it in a JSON response.
          return response.send({ token: token.toJwt() });
        }).catch((err) => {
          console.log(err);
        });

      });
    }
  }
module.exports = controllers;