var express = require('express');
var url = require("url");
var fs = require("fs");
var path = require('path');

var router = express.Router();

router.get("*", (req, res, next) => {
    var query = url.parse(req.url, true).query;
    
    var dirPath = path.join(__dirname, "../public/", query.dir);
    
    fs.readdir(dirPath, (err, list) => {
        if (err) return next(err);
        res.json(list);
    });
});

module.exports = router;