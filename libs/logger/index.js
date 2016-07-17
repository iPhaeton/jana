var fs = require("fs");
var ENV = process.env.NODE_ENV;

module.exports = function (module) {
    var app = require("app");
    var self = new Object();

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
            fs.access(app.get("errorsLogFilePath"), fs.W_OK, function (e) {
                if (e) {
                    require("../createErrorsLogFile")(app);
                    self.logger = require("./logger")(module, app);
                };
                if (req) self.logger.error(req.method + " " + req.originalUrl);
                self.logger.error(err);
            });
        };
        if (app.get("env") !== "development") self.logger.error(err);
    };

    return self;
};