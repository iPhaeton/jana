"use strict";

class SockConnection {
    constructor (url) {
        this.url = url;
        this.callbacks = {
            searchResult: null
        }
    };
    
    connect () {
        this.connection = new SockJS(this.url);
        //this.connection.addEventListener("connection", this.setHandlers);

        var self = this;
        this.connection.onopen = function() {
            //console.log(self.connection.readyState);
            //self.connection.send("test");
        };

        this.connection.onmessage = function (event) {
            var json = JSON.parse(event.data),
                data = json.data,
                type = json.type,
                done = json.done,
                key = json.key;

            if (!self.callbacks[type]) return;

            if (data === "Error") self.callbacks[type](new Error(type + " error"));
            else self.callbacks[type](null, data, done, key);
        };
    };

    send (data) {
        this.lastRequest = data;
        this.connection.send(data);
    };

    setHandlers () {

    }
};