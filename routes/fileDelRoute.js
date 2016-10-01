var express = require('express');
var fileDel = require("libs/fileDel");

var router = express.Router();

router.get("*", (req, res, next) => {
    fileDel (req, res, next);
});

module.exports = router;