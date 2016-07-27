function makeDBSearchRequest (reqStr, callback) {
    $.ajax({
        url: reqStr,
        type: "GET",
        dataType: "json"
    })
    .done(function (json) {
        callback(null, json);
    })
    .fail(function (xhr, status, err) {
        callback(err);
    });
};

function makeDBSaveRequest (reqStr, data, callback) {
    $.ajax({
        url: reqStr,
        type: "POST",
        data: data,
        statusCode:{
            200: function () {
                callback(null)
            },
            403: function (jqXHR) {
                callback(JSON.parse(jqXHR.responseText));
            }
        }
    });
};

function makeFileSaveRequest(reqStr, file, callback) {
    $.ajax({
        url: reqStr,
        type: "POST",
        data: file,
        headers: {
            "x-file-name": file.name || file //file may be a file or a string with a file name
        },
        processData: false,
        contentType: false,
        statusCode:{
            200: function () {
                callback(null)
            },
            403: function (jqXHR) {
                callback(JSON.parse(jqXHR.responseText));
            }
        }
    });
};

function makeFileDeleteRequest(reqStr, callback) {
    $.ajax({
        url: reqStr,
        type: "GET"
    })
    .done(function () {
        callback();
    })
    .fail(function (xhr, status, err) {
        callback(err);
    });
}

function makeListRequest(reqStr, callback) {
    $.ajax({
        url: reqStr,
        type: "GET",
        dataType: "json"
    })
    .done(function (json) {
        callback(null, json);
    })
    .fail(function (xhr, status, err) {
        callback(err);
    });
};

//Registration and authorization------------------------------------------------------------------------------------------------------------------------------------
function makeAuthorizationRequest (reqStr, form, callback) {
    $.ajax({
        url: reqStr,
        type: "POST",
        data: form.serialize(),
        statusCode:{
            200: function () {
                callback(null)
            },
            403: function (jqXHR) {
                callback(JSON.parse(jqXHR.responseText));
            }
        }
    });
};