var app = require("app");

module.exports = function (id, property, value, del) {
    var sockets = app.get("sockets") || {};
    
    if (del) {
        delete sockets[id];
    } else {
        if (!sockets[id]) sockets[id] = {};
        sockets[id][property] = value;
    };

    if (!app.get("sockets")) app.set("sockets", sockets);
};
