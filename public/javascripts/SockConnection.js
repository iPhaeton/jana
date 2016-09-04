"use strict";

class SockConnection {
    constructor (url) {
        this.url = url;
    };
    
    connect () {
        this.connection = new SockJS(this.url);
        //this.connection.addEventListener("connection", this.setHandlers);

        var self = this;
        this.connection.onopen = function() {
            console.log(self.connection.readyState);
            self.connection.send("test");
        };
    };

    setHandlers () {

    }
};

//function establishWebSocket() {
    /*var socket = new WebSocket("ws://" + window.location.hostname + ":3000");
    return socket;*/

    

    /*sock.add
    sock.send('test');*/
//};