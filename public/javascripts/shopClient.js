var mode = "view";

$(document).ready(() => {
    var thumbnails;
    var config;

    $(".side-menu").on("click", ".menu-button", function (event) {
        var target = $(event.target);
        target = findTarget(target, "menu-button", "a");
        if(!target) {
            event.preventDefault();
            return;
        };

        async.parallel([
            //get configuration
            function (callback) {
                if (!config) makeDBSearchRequest("/dbsearch?db=Config", callback);
                else (callback(null, config));
            },
            function (callback) {
                makeDBSearchRequest(target.attr("href"), callback);
            }
        ], function (err, results) {
            var config = results[0][0],
                data = results[1];

            if (err) {
                alert("Извините, проблема с базой данных");
                return;
            };

            if (!thumbnails) thumbnails = new Thumbnails("#commodity-list", data, parseConfig(config));
            thumbnails.clear();
            thumbnails.build();
            thumbnails.render();
        });

        event.preventDefault();
    });

    $(".edit-button").on("click", function (event) {
        if (mode !== "edit") {
            mode = "edit";
            $(this).text("Просмотр");
        } else {
            mode = "view";
            $(this).text("Редактирование");
        }

        if (!thumbnails) thumbnails = new Thumbnails("#commodity-list", data, parseConfig(config));
        thumbnails.clear();
        thumbnails.build();
        thumbnails.render();
    })
});

//parse the config object------------------------------------------------------------------------------------------
function parseConfig(config) {
    for (var field in config.showcase) {
        if (config.showcase[field].css) {
            config.showcase[field].css = new Function ("data", config.showcase[field].css);
        };
    };

    return config;
};

//Thumbnails-------------------------------------------------------------------------------------------------------
function Thumbnails (elem, data, config) {
    this.elem = $(elem);
    this.data = data;
    this.config = config;
    this.tiles = new Set();
};

Thumbnails.prototype.build = function () {
    for (var i = 0; i < this.data.length; i++) {
        this.tiles.add(new Thumbnail(this.data[i], this.config));
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

//Thumbnail--------------------------------------------------------------------------------------------------------
function Thumbnail (data, config) {
    this.data = data;
    this.details = new Details(this);
    var self = this;

    //config = undefined;
    if (!config) {
        config = {
            showcase: {
                "Название": {
                    withTitle: false
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
        }
    };

    var col = $("<div class='col-sm-3'></div>");
    
    var div = $("<div class='thumbnail'></div>");
    div.css({
        textAlign: "right"
    });

    var img = $("<img src=" + (this.data.img || "'images/defaultPic.gif'") + ">");
    
    var button = $("<button type='button' class='btn btn-default'>" + (mode === "view"? "Подробнее>>" : "Редактировать>>") + "</button>");
    button.on("click", function (event) {
        self.details.render();
    });

    div.append(img);

    var fields = gatherItemsInOrder(config.showcase);
    for (var i = fields.length-1; i >= 0; i--) {
        if (data.specs[fields[i]]) {
            var p = $("<p>" + ((config.showcase[fields[i]].withTitle) ? (fields[i] + ": " + data.specs[fields[i]]) : (data.specs[fields[i]])) + "</p>");
            if (config.showcase[fields[i]].css) p.css(config.showcase[fields[i]].css(data));
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

    closeButton.on("click", this.close.bind(this));

    var clearFix = ($("<div class='clearfix'></div>"));
    
    var content = this.createContent();

    this.elem.append(closeButton);
    this.elem.append(clearFix);
    this.elem.append(content);

    $(document.body).append(this.elem);
    this.elem.css({
        minWidth: this.elem.get(0).clientWidth + 2 + "px", //the width is a bit bigger than it should be to avoid moving of the lists when a display is narrower than the div
        padding: "0 0 1px 1px"
    });

    $(window).on("resize", this.position.bind(this));

    this.position();
};

Details.prototype.createContent = function () {
    var content = $("<form></form>");

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
    var items = gatherItemsInOrder(this.parentElem.data.specs);

    if (mode !== "edit") {
        for (var i = items.length - 1; i >= 0; i--) {
            keyList.append($("<li class='list-group-item'>" + items[i] + "</li>"));
            valueList.append($("<li class='list-group-item'>" + this.parentElem.data.specs[items[i]] + "</li>"));
        };
    } else {
        for (var i = items.length - 1; i >= 0; i--) {
            keyList.append($("<input class='list-group-item' name='key'" + " value='" + items[i] + "'>"));
            valueList.append($("<input class='list-group-item' name='val'" + " value='" + this.parentElem.data.specs[items[i]] + "'>"));
        };
    }

    content.append(keyList);
    content.append(valueList);
    content.append($("<div class='clearfix'></div>"));

    if (mode === "edit") {
        var saveButton = $("<button type='submit' class='btn btn-default'>Сохранить</button>");
        saveButton.css({
            float: "right"
        });

        var cancelButton = $("<button type='button' class='btn btn-default'>Отмена</button>");
        cancelButton.css({
            float: "right"
        });
        cancelButton.on("click", this.close.bind(this));

        content.append(cancelButton);
        content.append(saveButton);
    };
    
    content.on("submit", this.submit.bind(this));
    
    return content;
};

Details.prototype.close = function () {
    this.elem.detach();
    $(window).off("resize", this.position.bind(this));
};

//set position when the window is resized
Details.prototype.position = function () {
    this.elem.css({
        top: "10%",
        left: (window.pageXOffset || document.documentElement.scrollLeft) + (document.documentElement.clientWidth/2) - (this.elem.get(0).offsetWidth/2) + "px"
    });
};

Details.prototype.submit = function (event) {
    var form = $(event.target);
    
    makeDBSaveRequest("/dbsave?db=Commodity&id=" + this.parentElem.data._id, form, function (err) {
        if (err) alert (err.message);
    });

    this.close();
    
    event.preventDefault();
};