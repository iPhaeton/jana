$(document).ready(() => {
    var commodityList = $("#commodity-list");

    var thumbnail = new Thumbnail();
    var row = $(<div class="row"></div>);
    row.append(thumbnail);
    commodityList.append(row);
});

function Thumbnail () {
    var col = $("<div class="col-md-3"></div>")
    
    var div = $("<div class="thumbnail"></div>");
    div.css({
        width: "20%",
        height: "30%",
        textAlign: "right"
    });

    var img = $("<img src='images/testPic.jpg'>");
    img.css({
        width: "80%",
        height: "80%"
    });

    var price = $("<p>1000 р.</p>")
    price.css({
        color: "#f00"
    });

    div.append(img);
    div.append(price);
    col.append(div)

    return col;
};
