function makeSearchRequest(request, data, callback) {
    $.ajax({
        url: "/search?" + request,
        type: "GET",
        dataType: "json",
        data: data,
        statusCode: {
            200: function (json) {
                callback(null, json);
            },
            404: function (jqXHR) {
                callback(JSON.parse((jqXHR.responseText)));
            }
        }
    })
};

/*
function makeSearchRequest(request, data, callback) {
    $.ajax({
        url: "/search?" + request,
        type: "GET",
        dataType: "json",
        data: data,
        statusCode: {
            200: function (json) {
                callback(null, json);
            },
            404: function (jqXHR) {
                callback(JSON.parse((jqXHR.responseText)));
            }
        }
    })
};
