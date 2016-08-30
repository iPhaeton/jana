var express = require('express');

var router = express.Router();
var url = require("url");
var find = require("libs/find");
var dbSearch = require("libs/dbSearch");
var gatherDocsById = require("libs/gatherDocsById");

router.get("*", (req, res, next) => {
    var query = url.parse(req.url, true).query;
    
    var result = find(query);

    gatherDocsById(result, (err, commodities) => {
        if (err) return next(err);
        res.json(commodities);
    })
});

module.exports = router;