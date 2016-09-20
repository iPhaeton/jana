function makeSearchRequest(request, data, callback) {
    socket.callbacks.searchResult = function (err, data) {
        if (data === "searchComplete") {
            callback(null, null);
            return;
        };

        if (err) {
            alert("Ошибка поиска. Выведены не все результаты.");
            socket.callbacks.searchResult = null;
            return;
        };
    };

    socket.send(JSON.stringify({
        request: "/search?" + request,
        data: data
    }));
};