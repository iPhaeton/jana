var express = require('express');
var url = require("url");
var dbDel = require("libs/dbDel");

var router = express.Router();

router.post("*", (req, res, next) => {
    var query = url.parse(req.url, true).query;

    //find and delete a doc
    dbDel (query, next, function (err) {
        if (err) return next(err);
        res.sendStatus(200);
    })
});

module.exports = router;