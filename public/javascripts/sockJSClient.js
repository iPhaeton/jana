function makeSearchRequest(request, data, onSearchEnd, onSearchResult) {
    var key = Math.random();

    socket.callbacks.searchResult = function (err, data, done, resultKey) {
        if (data === "searchComplete") {
            onSearchEnd(null, null);
            return;
        };

        if (err) {
            alert("Ошибка поиска. Выведены не все результаты.");
            socket.callbacks.searchResult = null;
            return;
        };

        if (resultKey !== key) return;

        onSearchResult(data, done);
    };

    socket.send(JSON.stringify({
        request: "/search?" + request,
        data: data,
        key: key
    }));
};