var logger = new require('libs/logger')(module);
var app = require("app");
var createForest = require("libs/search/forest");

module.exports = function (err) {
    if (err) {
        logger.logErr(err);
    } else {
        if (app.get("env") === "test") app.set("dbConnected", true);
        logger.log("db ok");

        createForest();
    };
};
