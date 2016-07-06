
$(document).ready(() => {
    var commodityList = $("#commodity-list");

    var thumbnail = new Thumbnail();
    var row = $("<div class='row'></div>");
    row.append(thumbnail);
    commodityList.append(row);
});

function Thumbnail () {
    var col = $("<div class='col-md-3'></div>")
    
    var div = $("<div class='thumbnail'></div>");
    div.css({
        textAlign: "right"
    });

    var img = $("<img src='images/testPic.jpg'>");
    /*img.css({
        width: "80%",
        height: "80%"
    });*/

    var price = $("<p>1000 р.</p>")
    price.css({
        color: "#c00"
    });
    
    var avialability = $("<p>В наличии: 10</p>")
    avialability.css({
        color: "#0f0"
    });
    
    var button = $("<button type='button' class='btn btn-default'>Подробнее>></button>")

    div.append(img);
    div.append(price);
    div.append(avialability);
    div.append(button);
    col.append(div)

    return col;
};
