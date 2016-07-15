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
            "Самое вкусное": "/dbsearch?db=Commodity&specs=specs.Категория:Лыжи",
            //"Самое вкусное": "/dbsearch?category=Лыжи&name=Самые%20лучшие%20лыжи&specs=specs.Цвет:Жёлтенькие;specs.Длина:1,5%20м",
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

