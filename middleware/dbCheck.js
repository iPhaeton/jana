var app = require("app");

var DBError = require("errors").DBError;
var HttpError = require("errors").HttpError;
var FileSaveError = require("errors").FileSaveError;

module.exports = function(req, res, next) {
    if (app.get("dbConnected")) {
        next();
    } else {
        //next(new FileSaveError(503, "База данных недоступна"));
        next(new DBError());
    }
};