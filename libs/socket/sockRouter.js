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
        var result = find(query);

        this.socket.write(JSON.stringify({type: "searchResult", data: result}));

        /*if (result.size) {
            gatherDocsById(result, (err, commodities) => {
                if (err) this.socket.write(JSON.stringify({type: "searchResult", data: "Error"}));
                else this.socket.write(JSON.stringify({type: "searchResult", data: commodities}));
            });
        } else {
            this.socket.write(JSON.stringify({type: "searchResult", data: null}));
        };*/
    };
};

module.exports = Router;