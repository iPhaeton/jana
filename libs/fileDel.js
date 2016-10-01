var fs = require("fs");
var path = require('path');
var FileSaveError = require("errors").FileSaveError;
var url = require("url");

module.exports = function (req, res, next) {
    var query = url.parse(req.url, true).query;
    var filePath = path.join(__dirname, "../public/", query.dir, query.file);
    
    fs.access(filePath, (err) => {
        if (err) return next (new FileSaveError(404, "Файл не найден"));
        
        fs.unlink(filePath, (err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });
};