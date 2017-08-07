var fs = require('fs');
var app = require('express')();
var http = require('http');
var logger = require('./services/logger');
var config = require('./config/config');
var controllers = require('./controllers');
var sockets = require('./sockets');
var port = process.env.PORT || 3000;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
var httpServer = http.createServer(app);

//lets create all the controllers
controllers.init(app);
//lets create all the sockets
sockets.init(app,httpServer);

httpServer.listen(port, function () {
  logger.log('listening on Http *:' + port)
})

