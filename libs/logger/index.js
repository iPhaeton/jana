var fs = require("fs");
var ENV = process.env.NODE_ENV;

exports.create = function (module, app) {
    var logger = require("./logger")(module, app);

    exports.log = function (message) {
        logger.info(message);
    };

    exports.logReq = function (req) {
        logger.debug(req.method + " " + req.originalUrl);
    };

    exports.logErr = function (err, req) {
        if (ENV !== "development") {
            //in production mode for errors output check, if the file is accessible, if not create another one and recreate the logger, so that errors are logged anyway
            fs.access(app.get("errorsLogFilePath"), fs.W_OK, function (e) {
                if (e) {
                    require("../createErrorsLogFile")(app);
                    logger = require("./logger")(module, app);
                };
                logger.error(req.method + " " + req.originalUrl);
                logger.error(err);
            });
        };
        //logger.error(err);
    };
};