"use strict";

var url = require("url");
var find = require("libs/find");
var gatherDocsById = require("libs/gatherDocsById");

class Router {
    constructor () {};

    route (socket, reqData) {
        this.socket = socket;

        var reqData = JSON.parse(reqData);

        var request = url.parse(reqData.request, true);

        this[request.pathname](request.query);
    };
    
    ["/search"] (query) {
        var result = find(query, this.socket);
    };
};

module.exports = Router;