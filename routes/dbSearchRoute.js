var express = require('express');
var url = require("url");
var dbSearch = require("libs/dbSearch");
var HttpError = require("errors").HttpError;

var router = express.Router();

router.get("*", (req, res , next) => {
    var query = url.parse(req.url, true).query;

    var axillaryParams = parseSpecs(query);
    if (!axillaryParams.model) return next(new HttpError(400, "No model has been passed"));

    dbSearch(axillaryParams.model, query, axillaryParams.field, (err, commodities) => {
        if (err) return next(err);
        res.json(commodities);
    });
});

function parseSpecs (query) {
    if (!query.db) return;

    var model = query.db;
    delete query.db;

    if (query.specs) {
        var specs = query.specs.split(";");
        for (var i = 0; i < specs.length; i++) {
            var keyVal = specs[i].split(":");
            query[keyVal[0]] = keyVal[1];
        };
        delete query.specs;
    };
    
    if (query.field) {
        var field = query.field;
        delete query.field;
    }

    return {
        model: model,
        field: field
    };
};

module.exports = router;