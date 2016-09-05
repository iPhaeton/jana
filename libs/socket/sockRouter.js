var url = require("url");
var find = require("libs/find");
var gatherDocsById = require("libs/gatherDocsById");

module.exports = function (reqData) {
    var reqData = JSON.parse(reqData);

    var query = url.parse(reqData.request, true).query;

    var result = find(query);

    if (result.size) {
        gatherDocsById(result, (err, commodities) => {
            if (err) this.write(JSON.stringify({type: "searchResult", data: "Error"}));
            else this.write(JSON.stringify({type: "searchResult", data: commodities}));
        });
    } else {
        this.write(JSON.stringify({type: "searchResult", data: null}));
    }
};