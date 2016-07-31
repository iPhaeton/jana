var express = require('express');

var router = express.Router();

router.post("*", (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        //res.redirect("/");
        res.sendStatus(200);
    })
});

module.exports = router;
