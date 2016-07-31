var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: "Jana",
    headMenuLeft: {
      "Магазин": "/shop",
      "Контакты": "/contcts",
    },
    headMenuRight: {
      [(req.user ? "Выйти" : "Войти")]: (req.user ? "/signout" : "/signin"),
      "Регистрация": "/signup"
    }
  });
});

module.exports = router;
