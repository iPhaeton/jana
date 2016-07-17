var express = require('express');
var url = require("url");
var dbSave = require("libs/dbSave");

var router = express.Router();

router.post("*", (req, res, next) => {
    var query = url.parse(req.url, true).query;

    //find and save a doc
    dbSave(query.db, query.id, parseBody(req.body), next, function (err) {
        if (err) return next(err);
        res.send(200);
    })
});

function parseBody(body) {
    var reqBody = {specs:{}};

    for (var i = 0; i < body.key.length; i++) {
        if (body.key[i] === "number" || body.key[i] === "img"){
            reqBody[body.key[i]] =  body.val[i];
        } else if (body.key[i]) {
            reqBody.specs[body.key[i]] =  body.val[i];
        }
    };
    
    return reqBody;
};

module.exports = router;