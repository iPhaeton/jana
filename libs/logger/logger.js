var winston = require("winston");
var ENV = process.env.NODE_ENV;

module.exports = function (module, app) {
    var path = module.filename.split("\\").slice(-2).join("\\");

    var transports = [
        new winston.transports.Console({
            timestamp: true,
            colorize: true,
            level: (ENV === "development") ? "debug" : "error",
            label: path
        })
    ];

    if (ENV !== "development") {
        transports.push(new winston.transports.File({
            timestamp: true,
            colorize: true,
            level: "info",
            label: path,
            filename: app.get("errorsLogFilePath"),
            json: false
        }));
    };

    return new winston.Logger({transports: transports});
};