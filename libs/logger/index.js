var fs = require("fs");
var HttpError = require("errors").HttpError;
var ENV = process.env.NODE_ENV;

module.exports = function (module) {
    var app = require("app");
    var self = new Object();
    var moduleName = module.filename.split("\\");
    if (moduleName.length === 1) moduleName = module.filename.split("/");

    self.logger = require("./logger")(module, app);

    self.log = function (message) {
        self.logger.info(message);
    };

    self.logReq = function (req) {
        self.logger.debug(req.method + " " + req.originalUrl);
    };

    self.logErr = function (err, req) {
        if (ENV !== "development") {
            //in production mode for errors output check, if the file is accessible, if not create another one and recreate the logger, so that errors are logged anyway
            if (app.get("errorsLogFilePath")) {
                fs.access(app.get("errorsLogFilePath"), fs.W_OK, function (e) {
                    if (e) {
                        require("../createErrorsLogFile")(app, (e) => {
                            self.logger = require("./logger")(module, app);
                            if (e) self.logger.log("Errors logfile has not been created");

                            logError(err, req, self.logger);
                        });
                    } else {
                        logError(err, req, self.logger);
                    };
                });
            } else {
                logError(err, req, self.logger);
            };
        } else
        {
            //dbConnect.js isn't a part of express, therefore no next(err) may be called
            if (err instanceof HttpError || moduleName[moduleName.length - 1] === "dbConnect.js") self.logger.error(err);
        }
    };

    return self;
};

function logError(err, req, logger) {
    if (req) logger.error(req.method + " " + req.originalUrl);
    logger.error(err);
}