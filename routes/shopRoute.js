var express = require('express');
var router = express.Router();
var mongoose = require("libs/mongoose");
var fs = require("fs");

router.get('/', function(req, res, next) {
    fs.readFile("./public/build/build.json", (err, data) => {
        if (err) return next(err);

        var buildPaths = JSON.parse(data);

        mongoose.models["Category"].find({}, (err, categories) => {
            if (err) return next(err);

            categories.sort((a, b) => {
                return a.position - b.position;
            });
            /*var menuButtons = {};
             for (var i = 0; i < categories.length; i++) {
             menuButtons[categories[i].name] = categories[i].url;
             };*/

            res.render("shop", {
                env: process.env.NODE_ENV,
                paths: buildPaths,
                title: "Jana - shop",
                headMenuLeft: {
                    "Магазин": "/shop",
                    "Контакты": "/contacts",
                },
                headMenuRight: {
                    [(req.user ? "Выйти" : "Войти")]: (req.user ? "/signout" : "/signin"),
                    "Регистрация": "/signup"
                },
                sideMenu: categories,
                container: false,
                searchButton: true
            });
        });
    });
});

module.exports = router;

