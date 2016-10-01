var mongoose = require("libs/mongoose");

module.exports = function (model, id, data, next, callback) {
    if (id !== "null") {
        mongoose.models[model].findById(id, (err, commodity) => {
            if (err) return callback (err);
        
            if (!commodity) {
                var commodity = new mongoose.models.Commodity(data);
                commodity.save((err) => {
                    if (err) return next(err);
                    callback();
                });
            } else {
                commodity.writeData(data, next, callback);
            };
        });
    } else {
        var commodity = new mongoose.models[model](data);
        commodity.save((err) => {
            if (err) return callback(err);
            callback();
        });
    };
};