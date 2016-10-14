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
            var id = commodity.id;
            commodity.remove(() => {
                if (err) {
                    callback(err);
                    return;
                };

                var app = require("app");
                var forest = app.get("forest");
                for (var tree in forest.trees) {
                    if (forest.trees[tree].docs.has(id)) {
                        forest.trees[tree].docs.delete(id);
                    }
                }

                callback();
            });
        };
    };
};