var express = require('express');
var url = require("url");
var dbSave = require("libs/dbSave");
var HttpError = require("errors").HttpError;

var router = express.Router();

router.post("*", (req, res, next) => {
    var query = url.parse(req.url, true).query;

    //find and save a doc
    dbSave(query.db, query.id, parseBody(req.body, query.db), next, function (err) {
        if (err) {
            if (~err.message.indexOf("E11000")) return next(new HttpError(403, "Документ уже существует"));
            else return next(err);
        };
        res.sendStatus(200);
    })
});

function parseBody(body, db) {
    if (!body.key) return body;
    
    if (db === "Commodity") var reqBody = {specs:{}};
    else var reqBody = {};

    if (!(body.key instanceof Array)) {
        body.key = [body.key];
        body.val = [body.val];
    };

    for (var i = 0; i < body.key.length; i++) {
        if (db !== "Commodity" || body.key[i] === "img"){
            reqBody[body.key[i]] =  body.val[i];
        } else if (body.key[i]) {
            reqBody.specs[body.key[i]] =  body.val[i];
        }
    };
    
    return reqBody;
};

module.exports = router;