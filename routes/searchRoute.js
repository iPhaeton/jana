var express = require('express');

var router = express.Router();
var url = require("url");
var find = require("libs/find");

router.get("*", (req, res, next) => {
    var query = url.parse(req.url, true).query;
    
    var result = find(query);

    res.sendStatus(200);
});

module.exports = router;