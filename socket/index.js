var WebSocketServer = new require("ws");
var socketAuth = require("./socketAuth");
var logger = new require('libs/logger')(module);

var sockets = {};

module.exports = function (server) {
    var webSocketServer = new WebSocketServer.Server({
        server:server
    });

    webSocketServer.on("connection", function (socket) {
        socketAuth(socket.upgradeReq, function (err, results) {
            var id = Math.random() * Math.random() * Math.random();
            sockets[id] = results || {session: null, user: null};
            sockets[id].socket = socket;

            socket.on("close", function () {
                logger.log(id + " disconnected");
                delete sockets[id];
            });
        });
    });
};