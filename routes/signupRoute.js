var express = require('express');

var router = express.Router();

router.post("*", (req, res, next) => {
    var username = req.body.username,
        password = req.body.password;

    res.sendStatus(200);
});

module.exports = router;
