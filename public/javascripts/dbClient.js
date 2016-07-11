function makeDBSearchRequest (reqStr, ondone, onfail, onalways) {
    $.ajax({
        url: reqStr,
        type: "GET",
        dataType: "json"
    })
    .done(ondone)
    .fail(onfail)
    .always(onalways)
};