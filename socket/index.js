var WebSocketServer = new require("ws");
var socketAuth = require("./socketAuth");
var logger = new require('libs/logger')(module);
var sockjs = require("sockjs");

var sockets = {};

module.exports = function (server) {
    var sock = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });

    sock.installHandlers(server, {prefix:'/sock'});

    sock.on("connection", function (socket) {
        /*socketAuth(socket.upgradeReq, function (err, results) {
            logger.log ("SocjetJS connection");

            var id = Math.random() * Math.random() * Math.random();
            sockets[id] = results || {session: null, user: null};
            sockets[id].socket = socket;

            socket.on("close", function () {
                logger.log(id + " disconnected");
                delete sockets[id];
            });
        });*/
    });
};