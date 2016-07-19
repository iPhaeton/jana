var express = require('express');
var fileSave = require("libs/fileSave");

var router = express.Router();

router.post("*", (req, res, next) => {
    fileSave (req, res, next);
});

module.exports = router;