module.exports = function (query, socket) {
    var app = require("app");

    var forest = app.get("forest");
    
    return forest.find(query, socket);
};