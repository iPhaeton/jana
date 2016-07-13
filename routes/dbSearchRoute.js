var express = require('express');
var url = require("url");
var dbSearch = require("libs/dbSearch");

var router = express.Router();

router.get("*", (req, res , next) => {
    var reqParsed = url.parse(req.url, true);

    parseSpecs(reqParsed.query);

    dbSearch(reqParsed.query, (err, commodities) => {
        if (err) return next(err);
        res.json(commodities);
    });
});

function parseSpecs (query) {
    if (!query.specs) return;
    var specs = query.specs.split(";");

    for (var i = 0; i < specs.length; i++) {
        var keyVal = specs[i].split(":");
        query[keyVal[0]] = keyVal[1];
    };
    delete query.specs;
};

module.exports = router;