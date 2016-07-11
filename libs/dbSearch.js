var mongoose = require("libs/mongoose");
var Commodity = require("models/commodity");

module.exports = function (params, callback) {
    Commodity.find(params, (err, commodities) => {
        if (err) return callback(err);

        var info = new Array (commodities.length);
        for (var i = 0; i < commodities.length; i++) {
            info[i] = commodities[i]._doc;
        };
        
        callback (null, info);
    });
}