// main config.js file
process.env.NODE_ENV = process.env.NODE_ENV || 'local';
// load the config file for the current environment
var config = require('./env/' + process.env.NODE_ENV);
// export config
module.exports = config;