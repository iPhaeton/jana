var mode = "view";

var thumbnails,
    config,
    data;

$(document).ready(() => {
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
function Thumbnail (parent, data, config) {
    this.parent = parent;
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
        "Удалить": null
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
    var parentList = $(".dir-list");
    
    this.iframe = $("<iframe id='image-preview' src='images/" + this.selectedImage + "' scrolling='no'></iframe>");
    this.iframe.appendTo(parentList.parent()); 
    this.iframe.css({
        position: "absolute",
        top: parentList.position().top + "px",
        left: parentList.position().left + parentList.width() + "px",  //(window.pageXOffset || document.documentElement.scrollLeft) + (document.documentElement.clientWidth/2) - (this.elem.get(0).offsetWidth/2) + "px",
        background: "#fff",
        zIndex: "1"
    })
};

//Details---------------------------------------------------------------------------------------------------------------
function Details (parent) {
    if (!parent.data) return;

    this.parent = parent;

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

    this.keyList = $("<ul class='list-group'></ul>");
    this.valueList = $("<ul class='list-group'></ul>");
    this.removeList = $("<ul class='list-group'></ul>");

    this.keyList.css({
        float: "left",
        margin: "0px"
    });
    this.valueList.css({
        float: "left",
        margin: "0px"
    });
    this.removeList.css({
        float: "left",
        margin: "0px"
    });

    //for some reason properties are read in the opposite order
    var items = gatherItemsInOrder(this.parent.data.specs);

    for (var i = items.length - 1; i >= 0; i--) {
        this.addField({key: items[i], val: this.parent.data.specs[items[i]]});
    };

    content.append(this.keyList);
    content.append(this.valueList);
    content.append(this.removeList);
    content.append($("<div class='clearfix'></div>"));

    if (mode === "edit") {
        var saveButton = $("<button type='submit' class='btn btn-default' id='save-button'>Сохранить</button>");
        saveButton.css({
            float: "right"
        });

        var addButton = $("<button type='button' class='btn btn-default' id='add-button'>Добавить</button>");

        var cancelButton = $("<button type='button' class='btn btn-default' id='cancel-button'>Отмена</button>");
        cancelButton.css({
            float: "right"
        });

        content.append(cancelButton);
        content.append(addButton);
        content.append(saveButton);
    };
    
    content.on("submit", this.submit.bind(this));
    content.on("click", ".btn", this.editButtonClick.bind(this));
    
    return content;
};

Details.prototype.editButtonClick = function (event) {
    var target = $(event.target);
    target = findTarget(target, "btn");
    if (!target) return;

    switch (target.attr("id")) {
        case "add-button":
            this.addField();
            return;
        case "rm-button":
            this.removeField(target.attr("num"));
            return
        case "cancel-button":
            this.close();
            return;
    }
};

Details.prototype.addField = function (value) {
    if (mode === "edit") {
        this.keyList.append($("<input class='list-group-item' name='key' value='" + (value ? value.key : "") + "'>"));
        this.valueList.append($("<input class='list-group-item' name='val' value='" + (value ? value.val : "") +"'>"));
        this.removeList.append($("<input type='button' class='btn list-group-item' id='rm-button' num='" + this.removeList.children().length + "' value='Удалить'>"));
    } else {
        this.keyList.append($("<li class='list-group-item'>" + (value ? value.key : "") + "</li>"));
        this.valueList.append($("<li class='list-group-item'>" + (value ? value.val : "") + "</li>"));
    };
};

Details.prototype.removeField = function (num) {
    this.keyList.children().eq(+num).remove();
    this.valueList.children().eq(+num).remove();
    this.removeList.children().eq(+num).remove();
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
    
    makeDBSaveRequest("/dbsave?db=Commodity&id=" + this.parent.data._id, form, function (err) {
        if (err) alert (err.message);
        getData(data.url, createContent);
    });

    this.close();

    event.preventDefault();
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
    this.switch = new EditSwitch(this);

    this.elem = $(".edit-panel");
    this.elem.on("click", ".edit-button", this.buttonClick);
};

EditPanel.prototype.buttonClick = function (event) {
    
};

EditPanel.prototype.toggle = function () {
    if (this.elem.attr("hidden")) this.elem.removeAttr("hidden");
    else this.elem.attr("hidden", "true");
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

//Close all popups and details, if there are any-------------------------------------------------------------------------------------------------------------------------------
$(document.body).on("click keydown", function (event) {
    if (event.keyCode && event.keyCode !== 27) return;

    //close all popups
    
    
    //close image preview
    if(!findTarget($(event.target), "popup-button") || event.keyCode === 27) {
        $("#image-preview").remove();
        $(".popup-menu").detach();
    };

    //if click is not on a details button, close all details
    if(!findTarget($(event.target), "details-button") || event.keyCode === 27) {
        $("#details").detach();
        $(window).off("resize");
    };
});