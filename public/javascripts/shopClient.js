$(document).ready(() => {
    var thumbnails;

    $(".side-menu").on("click", ".menu-button", (event) => {
        var target = $(event.target);
        target = findTarget(target, "menu-button", "a");
        if(!target) {
            event.preventDefault();
            return;
        };
        
        makeDBSearchRequest(target.attr("href"), function (json) {
            thumbnails = new Thumbnails("#commodity-list", json);
            thumbnails.clear();
            thumbnails.build();
            thumbnails.render();
        });

        event.preventDefault();
    });
});

//Thumbnails-------------------------------------------------------------------------------------------------------
function Thumbnails (elem, data) {
    this.elem = $(elem);
    this.data = data;
    this.tiles = new Set();
};

Thumbnails.prototype.build = function () {
    for (var i = 0; i < this.data.length; i++) {
        this.tiles.add(new Thumbnail(this.data[i]));
    };
};

Thumbnails.prototype.render = function () {
    var i = 0;
    for (var tile of this.tiles) {
        if (i%4 === 0) {
            var row = $("<div class='row'></div>")
        };
        row.append(tile);
        if ((i-3)%4 === 0 || i === this.tiles.size - 1) {
            this.elem.append(row);
        };
        i++;
    };
};

Thumbnails.prototype.clear = function () {
    this.tiles.clear();
    this.elem.html("");
};

Thumbnails.prototype.unrender = function () {
    this.elem.html("");
};

////Thumbnail--------------------------------------------------------------------------------------------------------
function Thumbnail (data, config) {
    this.data = data;
    this.details = new Details(this);
    var self = this;
    
    if (!config) {
        config = {
            "Название": {
                withTitle: false,
            },
            "Цена": {
                withTitle: false,
                css: {
                    color: "#c00"
                }
            },
            "В наличии": {
                withTitle: true,
                css: (+(data.specs["В наличии"].split(" ")[0]) ? {
                    color: "#0f0"
                } : {
                    color: "#f00"
                })
            }
        }
    };

    var col = $("<div class='col-sm-3'></div>");
    
    var div = $("<div class='thumbnail'></div>");
    div.css({
        textAlign: "right"
    });

    var img = $("<img src=" + (this.data.img || "'images/defaultPic.gif'") + ">");
    
    var button = $("<button type='button' class='btn btn-default'>Подробнее>></button>");
    button.on("click", function (event) {
        self.details.render();
    });

    div.append(img);
    for (var field in config) {
        if (data.specs[field]) {
            var p = $("<p>" + ((config[field].withTitle) ? (field + ": " + data.specs[field]) : (data.specs[field])) + "</p>");
            if (config[field].css) p.css(config[field].css);
            div.append(p);
        }
    };
    div.append(button);
    col.append(div);

    return col;
};

//Details---------------------------------------------------------------------------------------------------------------
function Details (parentElem) {
    if (!parentElem.data) return;

    this.parentElem = parentElem;

    this.elem = $("<div id='details'></div>");
    this.elem.css({
        position: "fixed",
        background: "#079",
        padding: "0px"
    });
};

Details.prototype.render = function () {
    var self = this;

    $("#details").detach();

    if (this.elem.html()) {
        $(document.body).append(this.elem);
        return;
    };

    var closeButton = $("<div></div>");
    closeButton.css({
        width: "20px",
        height: "20px",
        float: "right"
    });
    var closeImg = $("<img src='/images/gtk-close.png'>");
    closeImg.css({
        width: "100%",
        height: "100%"
    });
    closeButton.append(closeImg);
    closeButton.hover(function () {
        $(this).css({
            cursor: "pointer"
        })
    });

    closeButton.on("click", function (event) {
        self.close();
    });

    var clearFix = ($("<div class='clearfix'></div>"));
    
    var keyList = $("<ul class='list-group'></ul>");
    var valueList = $("<ul class='list-group'></ul>");

    keyList.css({
        float: "left",
        margin: "0px"
    });
    valueList.css({
        float: "left",
        margin: "0px"
    });

    //for some reason properties are read in the opposite order
    var items = [];
    for(var item in this.parentElem.data.specs){
        items.push(item);
    };

    for(var i = items.length - 1; i >= 0; i--) {
        keyList.append($("<li class='list-group-item'>" + items[i] + "</li>"));
        valueList.append($("<li class='list-group-item'>" + this.parentElem.data.specs[items[i]] + "</li>"));
    };

    this.elem.append(closeButton);
    this.elem.append(clearFix);
    this.elem.append(keyList);
    this.elem.append(valueList);

    $(document.body).append(this.elem);
    this.elem.css({
        minWidth: this.elem.get(0).clientWidth + 2 + "px", //the width is a bit bigger than it should be to avoid moving of the lists when a display is narrower than the div
        padding: "0 0 1px 1px"
    });

    $(window).on("resize", this.position.bind(this));

    this.position();
};

Details.prototype.close = function () {
    this.elem.detach();
    $(window).off("resize", this.position.bind(this));
};

Details.prototype.position = function () {
    this.elem.css({
        top: "10%",
        left: (window.pageXOffset || document.documentElement.scrollLeft) + (document.documentElement.clientWidth/2) - (this.elem.get(0).offsetWidth/2) + "px"
    });
};