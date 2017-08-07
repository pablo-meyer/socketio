var config = require('../config/config');
var  controllers =
{
  init : function(app){
    app.get('/', function(req, res){
      var model =  { socketUrl:config.socketUrl,secureSocket: config.secureSocket };
      res.render('../views/home/index', {model});
  })  
  }
}
module.exports = controllers;