var HttpError = require("errors").HttpError;
var mongoose = require("libs/mongoose");

module.exports = function (query, next, callback) {
    if (query.id) mongoose.models[query.db].findById(query.id, deleteDoc);
    else if (query.name) mongoose.models[query.db].findOne({name: query.name}, deleteDoc);

    function deleteDoc (err, commodity) {
        if (err) return callback(err);
        if (!commodity) {
            callback(new HttpError(404, "Документ не найден"));
        } else {
            commodity.remove(callback);
        };
    };
};