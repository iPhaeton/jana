var fs = require("fs");

module.exports = function (req, res, next) {
    var fileStream = new fs.createWriteStream("public/images/img");

    req.pipe(fileStream);

    fileStream.on("close", () => {
        res.sendStatus(200);
    });

    fileStream.on("error", (err) => {
        next(err);
    });
};