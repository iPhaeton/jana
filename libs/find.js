module.exports = function (query) {
    var app = require("app");

    var forest = app.get("forest");
    
    return forest.find(query);
};