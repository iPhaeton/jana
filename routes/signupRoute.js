var express = require('express');
var User = require("models/user").User;
var HttpError = require("errors").HttpError;

var router = express.Router();

router.post("*", (req, res, next) => {
    var username = req.body.username,
        password = req.body.password;

    if (!username || !password) return next(new HttpError(400, "Все поля обязательны для заполнения"));

    User.register(username, password, (err) => {
        if (err) {
            if (~err.message.indexOf("E11000")) return next(new HttpError(403, "Пользователь с таким именем уже существует"));
            else return next(err);
        };

        res.sendStatus(200);
    });
});

module.exports = router;
