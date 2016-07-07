var mongoose = require("libs/mongoose");
var Commodity = require("models/commodity");

module.exports = function () {
    var logger = new require('libs/logger')(module);

    mongoose.connection.on("open", () => {
        var db = mongoose.connection.db;
        db.dropDatabase ((err) => {
            if (err) return console.log(err);
            logger.log("db ok");
        });
    });
};