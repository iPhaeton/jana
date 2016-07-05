$(document).ready(() => {
    var commodityList = $("#commodity-list");

    var thumbnail = new Thumbnail();
    commodityList.append(thumbnail);
});

function Thumbnail () {
    var div = $("<div></div>");
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

    return div;
};