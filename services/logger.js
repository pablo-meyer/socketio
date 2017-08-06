
var config = require('../config/config');
var leLogger = require('le_node');
var logger = new leLogger({  token: config.logEntriesToken });

module.exports = {
    log: function(message){
        console.log(message);
        logger.info(message);
    }
}