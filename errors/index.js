var util = require("util");
var http = require("http");

//Request errors------------------------------------------------------------------------------------------------
function HttpError (statusCode, message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);

    this.statusCode = statusCode;
    this.message = message || http.STATUS_CODES[statusCode] || "Error";
};
util.inherits(HttpError, Error);
HttpError.prototype.name = "HttptError";

exports.HttpError = HttpError;

//File type errors------------------------------------------------------------------------------------------------
function FileSaveError (statusCode, message) {
    HttpError.apply(this, arguments);
    Error.captureStackTrace(this, FileSaveError);
};
util.inherits(FileSaveError, HttpError);
FileSaveError.prototype.name = "FileSaveError";

exports.FileSaveError = FileSaveError;

//DB errors------------------------------------------------------------------------------------------------
function DBError () {
    HttpError.apply(this, [503, "База данных недоступна"]);
    Error.captureStackTrace(this, DBError);
};
util.inherits(DBError, HttpError);
DBError.prototype.name = "DBError";

exports.DBError = DBError;

//Authorization errors-----------------------------------------------------------------------------------------
function AuthError (message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthError);

    this.message = message;
};
util.inherits(AuthError, HttpError);
AuthError.prototype.name = "AuthError";

exports.AuthError = AuthError;