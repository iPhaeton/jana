var express = require('express');
var router = express.Router();
var mongoose = require("libs/mongoose");

router.get('/', function(req, res, next) {
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
            title: "Jana - shop",
            headMenuLeft: {
                "Магазин": "/shop",
                "Контакты": "/contcts",
            },
            headMenuRight: {
                "Войти": "/signin",
                "Регистрация": "signup"
            },
            sideMenu: categories
        });
    });
});

module.exports = router;

