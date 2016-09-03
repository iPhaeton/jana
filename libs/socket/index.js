var socketAuth = require("./socketAuth");
var logger = new require('libs/logger')(module);
var sockjs = require("sockjs");
var changeSocket = require("libs/changeSocket");

module.exports = function (server) {
    var sock = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });

    sock.installHandlers(server, {prefix:'/sock'});

    sock.on("connection", function (socket) {
        logger.log ("SocketJS connection - " + socket.url);

        changeSocket(socket.url, "socket", socket)

        socket.on("close", function () {
            logger.log(socket.url + " disconnected");
            changeSocket(socket.url, null, null, true);
        });
    });
};