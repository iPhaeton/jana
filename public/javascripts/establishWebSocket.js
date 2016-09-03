function establishWebSocket() {
    /*var socket = new WebSocket("ws://" + window.location.hostname + ":3000");
    return socket;*/

    var sock = new SockJS("http://" + window.location.hostname + ":3000/sock");
    //sock.send('test');
};