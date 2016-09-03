var socketAuth = require("./socketAuth");
var logger = new require('libs/logger')(module);
var changeSocket = require("libs/changeSocket");

module.exports = function (server) {
    server.on("upgrade", (req, socket, head) => {
        socketAuth(req, function (err, results) {
            logger.log ("SocketJS upgrade - " + req.url);

            changeSocket(req.url, "sessionData", results || {session: null, user: null});
        });
    });
};