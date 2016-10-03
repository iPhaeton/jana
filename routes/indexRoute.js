var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    env: process.env.NODE_ENV,
    title: "Jana",
    headMenuLeft: {
      "Магазин": "/shop",
      "Контакты": "/contacts",
    },
    headMenuRight: {
      [(req.user ? "Выйти" : "Войти")]: (req.user ? "/signout" : "/signin"),
      "Регистрация": "/signup"
    },
    container: true,
    searchButton: false
  });
});

module.exports = router;
