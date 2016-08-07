var mode = "view";

var thumbnails,
    config,
    data;

$(document).ready(function () {
    var editPanel = new EditPanel();

    $(document.body).css({
        height: $(window).height()
    });

    $(".side-menu").on("click", ".menu-button", function (event) {
        var target = $(event.target);
        target = findTarget(target, "menu-button", "a");
        if(!target) {
            event.preventDefault();
            return;
        };

        getData(target.attr("href"), createContent);

        event.preventDefault();
    });
});

function getData(url, callback) {
    async.parallel([
        //get configuration
        function (callback) {
            makeDBSearchRequest("/dbsearch?db=Config", callback);
        },
        function (callback) {
            makeDBSearchRequest(url, callback);
        }
    ], function (err, results) {
        config = parseConfig(results[0][0]);
        data = results[1];
        data.url = url;

        if (err) {
            alert("Извините, проблема с базой данных");
            return;
        };

        callback();
    });
};

function createContent () {
    if (!data || !config) return;

    if (!thumbnails) thumbnails = new Thumbnails("#commodity-list", data, config);
    thumbnails.clear();
    thumbnails.build(data, config);
    thumbnails.render();
};

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
function Thumbnails (elem, config) {
    this.elem = $(elem);
    this.tiles = new Set();
};

Thumbnails.prototype.build = function (data, config) {
    this.data = data;
    this.config = config;

    for (var i = 0; i < this.data.length; i++) {
        this.tiles.add((new Thumbnail(this, this.data[i], this.config)).elem);
    };
};

Thumbnails.prototype.render = function () {
    var row = $("<div class='row'></div>");

    for (var tile of this.tiles) {
        row.append(tile);
    };

    this.elem.append(row);
};

Thumbnails.prototype.clear = function () {
    this.tiles.clear();
    this.elem.html("");
};

Thumbnails.prototype.unrender = function () {
    this.elem.html("");
};

//Thumbnail--------------------------------------------------------------------------------------------------------
function Thumbnail (parent, data, config) {
    this.parent = parent;
    this.data = data || {
        img: undefined,
        specs:{}
    };
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

    var col = $("<div class='col-sm-6 col-md-4 col-lg-3'></div>");

    var div = $("<div class='thumbnail'></div>");
    div.css({
        textAlign: "right",
    });

    //need this to maintain a constant height for any image
    var imgContainer = $("<div class='thumbnail thumbnail-img-container'></div>");
    /*imgContainer.css({
        maxWidth: "100%",
        height: "200px",
        border: "none"
    });*/

    var img = $("<img src=" + (this.data.img || "'images/defaultPic.gif'") + " class='thumbnail-img'>");
    //make the image clickable
    if (mode === "edit") {
        img.hover(function () {
            $(this).css({
                cursor: "pointer"
            })
        });
        img.on("click", this.chooseImage.bind(this));
        img.on("contextmenu", this.showPopupMenu.bind(this));
    };

    var button = $("<button type='button' class='btn btn-default details-button'>" + (mode === "view"? "Подробнее>>" : "Редактировать>>") + "</button>");
    button.on("click", function (event) {
        self.details.render();
    });

    imgContainer.append(img);
    div.append(imgContainer);
    //div.append(img);

    var fields = gatherItemsInOrder(config.showcase);
    for (var i = fields.length-1; i >= 0; i--) {
        if (this.data.specs[fields[i]]) {
            var p = $("<p>" + ((config.showcase[fields[i]].withTitle) ? (fields[i] + ": " + this.data.specs[fields[i]]) : (this.data.specs[fields[i]])) + "</p>");
            if (config.showcase[fields[i]].css) p.css(config.showcase[fields[i]].css(this.data));
            div.append(p);
        };
    };

    div.append(button);

    col.append(div);

    //return col;
    this.elem = col;
};

Thumbnail.prototype.chooseImage = function (event) {
    $("#uploadInput").trigger("click", [this.data._id]);
};

Thumbnail.prototype.chooseImageOnServer = function (event) {
    var target = $(event.target);
    target = findTarget(target, "popup-button");
    if(!target) return;

    makeFileSaveRequest("/savefile?id=" + this.data._id, target.text(), function (err) {
        if (err) alert (err.message);
        getData(data.url, createContent);
    });
};

Thumbnail.prototype.showDirList = function (event) {
    makeListRequest("/list?dir=images" , (err, list) => {
        if (err) alert(err.messge);
        
        var files = {};
        for (var i = 0; i < list.length; i++) {
            files[list[i]] = [this.chooseImageOnServer.bind(this), this.showDirPopupMenu.bind(this)];
        };
        
        var menu = new PopupMenu(this.elem, null, files);
        menu.elem.addClass("dir-list");
    });
};

Thumbnail.prototype.showDirPopupMenu = function (event) {
    var target = findTarget($(event.target), "popup-button");
    if (!target) return;
    
    this.selectedImage = target.text();
    
    var menu = new PopupMenu(this.elem, event, {
        "Посмотреть": [this.showImage.bind(this)],
        "Удалить": [this.deleteImage.bind(this)]
    });
};

Thumbnail.prototype.showPopupMenu = function (event) {
    $(".popup-menu").detach();

    if (this.popupMenu) {
        this.popupMenu.render(event);
    } else {
        this.popupMenu = new PopupMenu(this.elem, event, {
            "Загрузить новое изображение": [this.chooseImage.bind(this)],
            "Выбрать изображение на сервере": [this.showDirList.bind(this)]
        });
    };
    event.preventDefault();
};

Thumbnail.prototype.showImage = function (event) {
    $("#image-preview").remove();
    var parentList = $(".dir-list");
    
    this.iframe = $("<iframe id='image-preview' src='images/" + this.selectedImage + "' scrolling='no'></iframe>");
    this.iframe.appendTo(parentList.parent()); 
    this.iframe.css({
        position: "absolute",
        top: parentList.position().top + "px",
        left: parentList.position().left + parentList.width() + "px",
        background: "#fff",
        zIndex: "1"
    });

    this.iframe.on("load", (function () {
        var img = this.iframe.contents().find("img");
        if ((img.width() > img.height()) && img.width() > this.iframe.width()) {
            $(img).css({
                width: "100%"
            });
        } else if (img.height() > this.iframe.height()) {
            $(img).css({
                height: "100%"
            });
        };
    }).bind(this));
};

Thumbnail.prototype.deleteImage = function (event) {
    makeFileDeleteRequest("/delfile?dir=images&file=" + this.selectedImage, function (err) {
        if (err) alert(err.message);
        getData(data.url, createContent);
    });
};

//Edit switch----------------------------------------------------------------------------------------------------------
function EditSwitch(parent) {
    this.parent = parent;

    this.elem = $("<button type='button' class='btn btn-default'>Редактировать</button>");
    this.elem.appendTo(document.body);

    this.elem.css({
        position: "absolute",
        top: "95%",
        left: "90%"
    });

    $(this.elem).on("click", this.switchMode.bind(this));
};

EditSwitch.prototype.switchMode = function () {
    if (mode !== "edit") {
        mode = "edit";
        this.elem.text("Просмотр");
        //create an input for uploading an image for a thumbnail
        if (!$("#uploadInput").length) this.createUploadInput();
    } else {
        mode = "view";
        this.elem.text("Редактирование");
    };

    createContent();

    this.parent.toggle();
};

EditSwitch.prototype.createUploadInput = function () {
    var uploadInput = $("<input type='file'>");
    uploadInput.attr("id", "uploadInput");
    uploadInput.css({
        width: "0",
        height: "0",
        border: "0",
        padding: "0"
    });
    $(document.body).append(uploadInput);

    var callerId;

    uploadInput.on("click", (event, id) => {
        callerId = id;
    });

    uploadInput.on("change", function (event) {
        makeFileSaveRequest("/savefile?id=" + callerId, this.files[0], function (err) {
            if (err) alert (err.message);
            getData(data.url, createContent);
        });
    });
};

//Edit panel-----------------------------------------------------------------------------------------------------------
function EditPanel () {
    if ($(".main-content").attr("admin-mode") === "true") this.switch = new EditSwitch(this);

    this.elem = $(".edit-panel");
    this.elem.on("click", ".edit-button", this.buttonClick.bind(this));
};

EditPanel.prototype.buttonClick = function (event) {
    var target = findTarget($(event.target), "edit-button");
    switch (target.attr("id")) {
        case "add-commodity":
            this.addCommodity();
            return;
        case "add-category":
            this.addCategory();
            return;
    };
};

EditPanel.prototype.toggle = function () {
    if (this.elem.attr("hidden")) this.elem.removeAttr("hidden");
    else this.elem.attr("hidden", "true");
};

EditPanel.prototype.addCommodity = function () {
    var questionnaire = new Dialog ({
        "Категория": "Лыжи",
        "Название": ""
    }, "Commodity");

    questionnaire.render();
};

EditPanel.prototype.addCategory = function () {
    var dialog = new Dialog({"Категория": ""}, "Category", function (form) {
        var formData = form.serializeArray();
        return {
            name: formData[1].value,
            url: "/dbsearch?db=Commodity&specs=specs.Категория:" + formData[1].value,
            position: $(".menu-button").length
        };
    }, function (data) {
        $(".side-menu").append("\
            <li class='menu-button'>\
                <a role='presentation' href='" + data.url + "'>" + data.name + "</a>\
            </li>\
        ");
    });
    dialog.render();
};

//Popup menu-----------------------------------------------------------------------------------------------------------
function PopupMenu(parent, invokingEvent, items) {
    this.parent = parent;
    this.elem = $("<div class='popup-menu'></div>");
    this.list = $("<ul class='list-group'></ul>");
    
    for (var item in items) {
        this.addField(item, items[item] ? items[item][0] : null, items[item] ? items[item][1] : null);
    };
    
    this.elem.append(this.list);
    
    this.render(invokingEvent);
};

PopupMenu.prototype.addField = function (itemName, onclick, oncontextmenu) {
    var item = $("<li class='btn list-group-item popup-button'>" + itemName + "</li>");

    this.list.append(item);

    item.on("click", (function (event) {
        if (onclick) onclick(event);
        event.preventDefault();
        this.close();
    }).bind(this));

    item.on("contextmenu", (function (event) {
        if (oncontextmenu) oncontextmenu(event);
        event.preventDefault();
    }).bind(this));
};

PopupMenu.prototype.render = function (invokingEvent) {
    var offset = this.parent.offset()
    this.parent.append(this.elem);
    this.elem.css({
        position: "absolute",
        left: invokingEvent ? (invokingEvent.clientX - offset.left + $(window).scrollLeft() + "px") : 
            ((window.pageXOffset || document.documentElement.scrollLeft) + (document.documentElement.clientWidth/2) - (this.elem.get(0).offsetWidth/2) - offset.left + "px"),
        top: invokingEvent ? (invokingEvent.clientY - offset.top + $(window).scrollTop() + "px") : "10%",
        zIndex: "1"
    });
};

PopupMenu.prototype.close = function () {
    this.elem.detach();
};