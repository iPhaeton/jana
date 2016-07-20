var fs = require("fs");
var path = require('path');
var FileSaveError = require("errors").FileSaveError;
var dbSave = require("libs/dbSave");
var url = require("url");

module.exports = function (req, res, next) {
    if (!checkFile(req.header("x-file-name"))) return next(new FileSaveError(400, "Неверный тип файла"));

    var filePath = path.join(__dirname, "../public/images", req.header("x-file-name"));
    fs.access(filePath, (err) => {
        var query = url.parse(req.url, true).query;

        //file exists
        if (!err) {
            dbSave("Commodity", query.id, {img: "/images/" + req.header("x-file-name")}, next, (err) => {
                if (err) return next(err);
                res.sendStatus(200);
            });
        //file is being uploaded
        } else {
            var fileStream = new fs.createWriteStream(filePath);

            req.pipe(fileStream);

            fileStream.on("close", () => {
                dbSave("Commodity", query.id, {img: "/images/" + req.header("x-file-name")}, next, (err) => {
                    if (err) return next(err);
                    res.sendStatus(200);
                });
            });

            fileStream.on("error", (err) => {
                next(err);
            });
        };
    });
};

function checkFile(fileName) {
    fileName = fileName.split(".");
    if (fileName[fileName.length - 1] !== "jpeg" && fileName[fileName.length - 1] !== "jpg" && fileName[fileName.length - 1] !== "tiff" &&
        fileName[fileName.length - 1] !== "gif" && fileName[fileName.length - 1] !== "png") {
        return false;
    } else {
        return true;
    };
};