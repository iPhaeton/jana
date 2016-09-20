function search (query, socket) {
    var app = require("app");

    var forest = app.get("forest");

    forest.find(query, socket);
};

function yieldSearchResults (socket) {
    var app = require("app");

    var forest = app.get("forest");

    return forest.yeildFinalResults(socket);
};

exports.search = search;
exports.yieldSearchResults = yieldSearchResults;