var mongoose = require("libs/mongoose");

module.exports = function (model, params, callback) {
    mongoose.models[model].find(params, (err, commodities) => {
        if (err) return callback(err);

        var info = new Array (commodities.length);
        for (var i = 0; i < commodities.length; i++) {
            info[i] = commodities[i]._doc;
        };
        
        callback (null, info);
    });
}