var fs = require("fs");
var path = require('path');

module.exports = function (app, callback) {
    var dirpath = path.join(__dirname.split("\\").slice(0,-1).join("\\"),"logs");

    try {
        fs.statSync(dirpath);
    } catch (err) {
        try {
            fs.mkdirSync(dirpath);
        } catch (err) {
            callback(err);
            return;
        }
    };

    createLogFile(app, dirpath, callback);
};

function createLogFile (app, dirpath, callback) {
    try {
        var filename = (new Date).toString().split(":").join("-") + ".log";
        app.set("errorsLogFilePath", path.join(dirpath, filename));
        var errorsLogFile = new fs.createWriteStream(app.get("errorsLogFilePath"), {flags: "w"});
    } catch (err) {
        callback(err);
        return;
    }

    var logger = new require('./logger')(module);
    logger.log("Logger");
    errorsLogFile.on("close", function () {
        logger.log("Errors log file has been closed");
    });

    process.on("SIGINT", function () {
        if (!errorsLogFile) process.exit();

        errorsLogFile.close(function (err) {
            process.exit();
        });
    });

    callback();
};