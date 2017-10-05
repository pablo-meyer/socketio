var logger = require('./logger');
var config = require('../config/config');
var AccessToken = require('twilio').jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;
var Twilio = require('twilio');

module.exports = {
    createRoom: function (roomName) {
        return new Promise((resolve, reject) => {
            var client = new Twilio(config.twillio.apiKey, config.twillio.apiSecret, { accountSid: config.twillio.accountId });
            client.video.rooms.create({
                uniqueName: roomName,
                type: 'group',
                recordParticipantsOnConnect: 'true'
            }).then((room) => {
                return resolve(room.sid);
            }).catch((err) => {
                return reject(err);
            });
        });
    },
    getRoomInfo: function (roomName) {
        return new Promise((resolve, reject) => {
            var client = new Twilio(config.twillio.apiKey, config.twillio.apiSecret, { accountSid: config.twillio.accountId });
            client.video.rooms.list({
                uniqueName: roomName
            }).then((room) => {

                return resolve(room);
            });
        });
    },
    getRooms: function (status) {
        return new Promise((resolve, reject) => {
            var client = new Twilio(config.twillio.apiKey, config.twillio.apiSecret, { accountSid: config.twillio.accountId });
            client.video.rooms.list({
                status: status
            }).then((rooms) => {
                return resolve(rooms);
            });
        });
    },
    getRecordings: function (roomId) {
        return new Promise((resolve, reject) => {
            var client = new Twilio(config.twillio.apiKey, config.twillio.apiSecret, { accountSid: config.twillio.accountId });
            client.video.recordings.list({
                groupingSid: [roomId]
            }).then((recordings) => {
                return resolve(recordings);
            });
        });
    },
    getToken: function (identity, roomName) {
        logger.log(`Getting twillio token for UserName: ${identity} Context:${roomName}`);
        token = new AccessToken(
            config.twillio.accountId,
            config.twillio.apiKey,
            config.twillio.apiSecret
        );
        // Assign the generated identity to the token.
        token.identity = identity;
        var grant = new VideoGrant();
        token.addGrant(grant);
        return token.toJwt();
    }
}