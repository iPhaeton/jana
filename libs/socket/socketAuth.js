var async = require("async");
var config = require("config");
var errors = require("errors");
var User = require("models/user").User;
var mongoose = require("libs/mongoose");
var cookieParser = require('cookie-parser');
var cookie = require("cookie");
var sessionStore = require("libs/sessionStore");
var logger = new require('libs/logger')(module);

module.exports = function (upgradeReq, onResult) {
    async.waterfall([
        function (callback) {
            var upgradeReqCookies = cookie.parse(upgradeReq.headers.cookie || "");
            var sidCookie = upgradeReqCookies[config.get("session:key")];

            var sid = cookieParser.signedCookie(sidCookie, config.get("session:secret"));

            loadSession(sid, callback)
        },
        function (session, callback) {
            if (!session) {
                callback(new HttpError(401, "No session"));
            };
            
            loadUser(session, callback);
        }
    ], onResult);
};

function loadSession(sid, callback) {
    sessionStore.load(sid, function (err, session) {
        if (arguments.length === 0) {
            return callback(null, null);
        } else if (err) {
            return callback(err);
        } else {
            return callback(null, session);
        }
    })
};

function loadUser(session, callback) {
    if (!session.user) {
        logger.log("Session " + session.id + " is anonymouse");
        return callback(null, null);
    };

    User.findById(session.user, function (err, user) {
        if (err) return callback(err);
        if (!user) return callback(null, null);
        logger.log("User: " + user.username);
        callback(null, {session: session, user: user});
    })
}