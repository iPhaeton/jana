function makeSearchRequest(request, data, callback) {
    socket.callbacks.searchResult = callback;

    socket.send(JSON.stringify({
        request: "/search?" + request,
        data: data
    }));
};