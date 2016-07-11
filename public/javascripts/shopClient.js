$(document).ready(() => {
    var thumbnails;

    $(".side-menu").on("click", (event) => {
        var target = $(event.target);
        target = findTarget(target, "menu-button", "a");
        if(!target.length) {
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


function Thumbnail (data, config) {
    this.data = data
    
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
                css: (+data.specs["В наличии"] ? {
                    color: "#0f0"
                } : {
                    color: "#f00"
                })
            }
        }
    };

    var col = $("<div class='col-sm-3'></div>")
    
    var div = $("<div class='thumbnail'></div>");
    div.css({
        textAlign: "right"
    });

    var img = $("<img src=" + (this.data.img || "'images/defaultPic.gif'") + ">");
    
    var button = $("<button type='button' class='btn btn-default'>Подробнее>></button>")

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