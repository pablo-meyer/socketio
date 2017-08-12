var config = require('../config/config');
var logger = require('../services/logger');
var AccessToken = require('twilio').jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;
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

        // Create an access token which we will sign and return to the client,
        // containing the grant we just created.
        var token = new AccessToken(
          config.twillio.accountId,
          config.twillio.apiKey,
          config.twillio.apiSecret
        );

        // Assign the generated identity to the token.
        token.identity = identity;

        // Grant the access token Twilio Video capabilities.
        var grant = new VideoGrant();
        token.addGrant(grant);

        // Serialize the token to a JWT string and include it in a JSON response.
        response.send({
          identity: identity,
          token: token.toJwt()
        });
      });
    }
  }
module.exports = controllers;