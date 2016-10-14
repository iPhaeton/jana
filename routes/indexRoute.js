var express = require('express');
var fs = require("fs");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  fs.readFile("./public/build/build.json", (err, data) => {
    if (err) return next(err);

    var buildPaths = JSON.parse(data);

    res.render('index', {
      env: process.env.NODE_ENV,
      paths: buildPaths,
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
});

module.exports = router;
