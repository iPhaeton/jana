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
                setTimeout((() => {
                    return function () {
                        open(callback);
                    };
                })(), 100 * countAttemptsToConnect);
            }, (err) => {
                if (err) callback(err);
                else callback();
            });
        },
        requireModels
    ], (err) => {
        if (err) logger.logErr(err);
        else logger.log("db ok");
    });

};

function open (callback) {
    if (countAttemptsToConnect !== undefined) countAttemptsToConnect++;

    if (process.env.PORT) {
        mongoose.connect (config.get("mongoose:uri"), config.get("mongoose:options"));
    } else {
        mongoose.connect ("mongodb://localhost/jana-shop", config.get("mongoose:options"));
    };

    mongoose.connection.on("open", (err) => {
        countAttemptsToConnect = 11;
        callback();
    });
    mongoose.connection.on("error", (err) => {
        if(!countAttemptsToConnect) return;
        if (countAttemptsToConnect > 9) {
            countAttemptsToConnect = undefined;
            callback(err);
        }
        else callback();
    });
};

function requireModels (callback) {
    require("models/commodity");
    require("models/config");
    require("models/category");

    async.each(Object.keys(mongoose.models), (model, callback) => {
        mongoose.models[model].ensureIndexes(callback);
    }, callback);
};