var app = require("app");

var mongoose = require("libs/mongoose");
var async = require("async");
var config = require("config");
var logger = new require('libs/logger')(module);

var countAttemptsToConnect = 0

module.exports = function (req, res, next) {
    var logger = new require('libs/logger')(module);

    async.series([
        (callback) => {
            async.whilst(() => {
                return countAttemptsToConnect < 10;
            }, (callback) => {
                setTimeout(() => {
                    logger.log("Tyring to connect to the database - " + countAttemptsToConnect);
                    open(callback);
                    countAttemptsToConnect++;
                }, 1000/* * countAttemptsToConnect*/);
            }, (err) => {
                countAttemptsToConnect = undefined;
                if (err) callback(err);
                else callback();
            });
        },
        requireModels
    ], (err) => {
        if (err) {
            app.set("dbConnected", false);
            logger.logErr(err);
        }
        else {
            app.set("dbConnected", true);
            logger.log("db ok");
        }
    });

};

function open (callback) {
    //var initiatedBy = countAttemptsToConnect;

    if (process.env.PORT) {
        mongoose.connect (config.get("mongoose:uri"), config.get("mongoose:options"));
    } else {
        mongoose.connect ("mongodb://localhost/jana-shop", config.get("mongoose:options"));
    };

    mongoose.connection.once ("open", onConnectionOpen);
    mongoose.connection.once ("error", onConnectionError);

    function onConnectionOpen (err) {
        mongoose.connection.removeListener("error", onConnectionError);

        if(!countAttemptsToConnect) return;
        countAttemptsToConnect = 11;
        callback();
    };

    function onConnectionError (err) {
        //logger.log("initiated by - " + initiatedBy);

        mongoose.connection.removeListener("open", onConnectionOpen);

        if (!countAttemptsToConnect) return;
        if (countAttemptsToConnect > 9) {
            callback(err);
        }
        else callback();
    };
};

function requireModels (callback) {
    require("models/commodity");
    require("models/config");
    require("models/category");

    async.each(Object.keys(mongoose.models), (model, callback) => {
        mongoose.models[model].ensureIndexes(callback);
    }, callback);
};