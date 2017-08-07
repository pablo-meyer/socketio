var chatSocket =require('./sockets/chat');

module.exports = 
{
    init : function(app,httpServer){chatSocket.init(app,httpServer);}
}