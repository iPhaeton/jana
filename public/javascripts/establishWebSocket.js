function establishWebSocket() {
    var socket = new WebSocket("ws://" + window.location.hostname + ":3000");
    return socket;
};