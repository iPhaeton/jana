function makeSearchRequest(request, data, onSearchEnd, onSearchResult) {
    socket.callbacks.searchResult = function (err, data) {
        if (data === "searchComplete") {
            onSearchEnd(null, null);
            return;
        };

        if (err) {
            alert("Ошибка поиска. Выведены не все результаты.");
            socket.callbacks.searchResult = null;
            return;
        };

        onSearchResult(data);
    };

    socket.send(JSON.stringify({
        request: "/search?" + request,
        data: data
    }));
};