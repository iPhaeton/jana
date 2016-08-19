var HttpError = require("errors").HttpError;
var mongoose = require("libs/mongoose");

module.exports = function (model, id, next, callback) {
    mongoose.models[model].findById(id, (err, commodity) => {
        if (err) return callback (err);
        if (!commodity) {
            callback (new HttpError(404, "Документ не найден"));
        } else {
            commodity.remove(callback);
        };
    });
};