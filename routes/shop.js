var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
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
        sideMenu: {
            "Самое вкусное": "#",
            "Лыжи": "#",
            "Сноуборды": "#",
            "Спортивная одежда": "#",
            "Спортивная обувь": "#",
            "Защитная экипировка": "#",
            "Семена и рассада": "#"
        }
    });
});

module.exports = router;

