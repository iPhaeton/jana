var socketAuth = require("./socketAuth");
var logger = new require('libs/logger')(module);
var sockjs = require("sockjs");
var changeSocket = require("libs/changeSocket");
var Router = require("libs/socket/sockRouter");

module.exports = function (server) {
    var router = new Router();

    var sock = sockjs.createServer({ sockjs_url: "/vendor/bower_components/sockjs/sockjs.min.js"});

    sock.installHandlers(server, {prefix:'/sock'});

    sock.on("connection", function (socket) {
        logger.log ("SocketJS connection - " + socket.url);

        changeSocket(socket.url, "socket", socket);

        socket.on("data", (reqData) => {
            router.route(socket, reqData);
        });

        socket.on("close", function () {
            logger.log(socket.url + " disconnected");
            changeSocket(socket.url, null, null, true);
        });
    });
};