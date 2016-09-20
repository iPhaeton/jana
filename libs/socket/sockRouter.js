"use strict";

var url = require("url");
var find = require("libs/find");

class Router {
    constructor () {};

    route (socket, reqData) {
        this.socket = socket;

        var reqData = JSON.parse(reqData);

        var request = url.parse(reqData.request, true);

        this[request.pathname](request.query);
    };
    
    ["/search"] (query) {
        find.search(query, this.socket);
    };
    
    ["/searchResults"] () {
        find.yieldSearchResults(this.socket);
    };
};

module.exports = Router;