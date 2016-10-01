var mongoose = require("libs/mongoose");

module.exports = function (model, params, field, callback) {
    mongoose.models[model].find(params, field, (err, commodities) => {
        if (err) return callback(err);

        //if (field) callback (new Error("Error"));
        if (field) callback (null, gatherFields(commodities, field));
        else callback (null, gatherDocs(commodities));
    });
};

function gatherDocs(commodities) {
    var info = new Array (commodities.length);
    for (var i = 0; i < commodities.length; i++) {
        info[i] = commodities[i]._doc;
    };
    return info;
};

function gatherFields(commodities, field) {
    field = field.split(".")[1];

    var info = {};
    for (var i = 0; i < commodities.length; i++) {
        info[commodities[i]._doc.specs[field]] = true;
    };
    return info;
}