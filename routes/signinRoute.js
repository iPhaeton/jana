var express = require('express');
var User = require("models/user").User;
var AuthError = require("models/user").AuthError;
var HttpError = require("errors").HttpError;

var router = express.Router();

router.post("*", (req, res, next) => {
    var username = req.body.username,
        password = req.body.password;

    User.authorize(username, password, (err, user) => {
        if (err) {
            if (err instanceof AuthError) return next(new HttpError(403, err.message));
            else return next(err);
        };

        req.session.user = user._id;
        res.sendStatus(200);
    });
});

module.exports = router;