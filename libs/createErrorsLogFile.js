var fs = require("fs");
var logger = require('./logger');

module.exports = function (app) {
    var filename = (new Date).toString().split(":").join("-");
    app.set("errorsLogFilePath", __dirname.split("\\").slice(0,-1).join("\\") + "\\logs\\" + filename + ".log");
    var errorsLogFile = new fs.createWriteStream(app.get("errorsLogFilePath"), {flags: "w"});

    logger.create(module);
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
};
