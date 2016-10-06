"use strict";

import headMenuListener from "./headMenu";
import {makeDBSearchRequest,
        makeFileSaveRequest,
        makeListRequest,
        makeFileDeleteRequest,
        makeDBDelRequest} from "./ajaxClient";
import {Details, Dialog} from "./modals";
import SearchPanel from "./searchPanel";
import {gatherItemsInOrder} from "./axillaries";

var mode = "view";

var thumbnails,
    storedData, //data and configare not necesarily needed to be reloaded on every getData
    storedConfig, //data and configare not necesarily needed to be reloaded on every getData
    searchPanel;

var socket = new SockConnection(window.location.origin + "/sock");
socket.connect();

$(document).ready(function () {
    headMenuListener();

    var editPanel = new EditPanel();

    $(document.body).css({
        height: $(window).height()
    });

    searchPanel = new SearchPanel({
        popups:[
            "Производитель"
        ]
    });

    $(".side-menu").on("click", ".menu-button", function (event) {
        var target = $(event.target);
        target = findTarget(target, "menu-button", "a");
        if(!target) {
            event.preventDefault();
            return;
        };

        sideMenuActive(target);

        getData(target.attr("href"), createContent);

        event.preventDefault();
    });
});

function getData(url, callback) {
    if (url === "search") {
        searchPanel.submit();
        return;
    }

    var config,
        data;

    async.parallel([
        //get configuration
        function (callback) {
            makeDBSearchRequest("/dbsearch?db=Config", callback);
        },
        function (callback) {
            makeDBSearchRequest(url, callback);
        }
    ], function (err, results) {
        storedConfig = config = parseConfig(results[0][0]);
        storedData = data = results[1];
        data.url = url;

        if (err) {
            alert("Извините, проблема с базой данных");
            return;
        };

        callback(data, config);
    });
};

function createContent (data, config) {
    //if called without any of the arguments, that argument is taken from the global variable
    //data and config are stored in global variables when they are taken from the database
    var data = data || storedData,
        config = config || storedConfig;

    if (!data && thumbnails) {
        thumbnails.clear();
    } 
    if(!config) return;

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
    this.previousWindowWidth = 0;
    this.focusExecuted = false;

    this.data = [];

    this.setHandlers();
};

Thumbnails.prototype.build = function (data, config) {
    if (!data) return;

    this.data = data;
    this.config = config;

    for (var doc of this.data) {
        this.tiles.add((new Thumbnail(this, doc, this.config, this.data.url)).elem);
    };
};

Thumbnails.prototype.render = function () {
    this.row = $("<div class='row'></div>");

    for (var tile of this.tiles) {
        this.row.append(tile);
    };

    this.elem.append(this.row);

    this.clearTiles(true)();
};

Thumbnails.prototype.add = function (dataToAdd, done) {
    if (!this.row) {
        this.row = $("<div class='row'></div>");
        this.elem.append(this.row);
    };

    var newThumbnail = (new Thumbnail(this, dataToAdd, this.config || storedConfig, "search"));

    this.tiles.add(newThumbnail.elem);
    this.row.append(newThumbnail.elem);
    this.clearTiles(true);

    this.data.push(dataToAdd);
    storedData = this.data;

    if (done) {
        this.clearTiles(true)();
    };
};

Thumbnails.prototype.clear = function () {
    this.data = [];
    this.tiles.clear();
    if (this.row) this.row.html("");
};

Thumbnails.prototype.unrender = function () {
    this.elem.html("");
};

//Need theese two functions to deal with tiles of differrent height
//The first one defines, if the clearance should be done on a particular resize
Thumbnails.prototype.clearTiles = function (executeAnyway) {

    return function () {
        var windowWidth = $(window).width();

        if (windowWidth < 768) {
            if (this.previousWindowWidth >= 768 || executeAnyway) {
                this.arrangeClears();
            }
        } else if (windowWidth >= 768 && windowWidth < 992) {
            if (this.previousWindowWidth < 768 || this.previousWindowWidth >= 992 || executeAnyway) {
                this.arrangeClears(3);
            };
        } else if (windowWidth >= 992 && windowWidth < 1200) {
            if (this.previousWindowWidth < 992 || this.previousWindowWidth >= 1200 || executeAnyway) {
                this.arrangeClears(4);
            };
        } else {
            if (this.previousWindowWidth < 1200 || executeAnyway) {
                this.arrangeClears(5);
            };
        }

        this.previousWindowWidth = windowWidth;
    }.bind(this);

};

//The second one does the clearance
Thumbnails.prototype.arrangeClears = function (clearThis) {
    if (!clearThis) {
        for (var tile in this.tiles) {
            tile.removeClass("first-in-a-row");
        };
        return;
    };

    clearThis--;

    var i = 0;
    for (var tile of this.tiles) {
        if (i%clearThis === 0) {
            tile.addClass("first-in-a-row");
        } else {
            tile.removeClass("first-in-a-row");
        };
        i++;
    };
};

Thumbnails.prototype.setHandlers = function () {
    $(window).on("resize", this.clearTiles(false));

    //Crazy firefox' feature that js isn't executed again, when a page is returned to, but window.onresize is lost, when a page is left
    //So I listen to document.onfocus and add window.onresize again
    $(document).on("focus", function () {
        if (this.focusExecuted) return;

        this.focusExecuted = true;

        this.clearTiles(true)();
        $(window).off("resize", this.clearTiles(false)); //just in case
        $(window).on("resize", this.clearTiles(false)); //when comming back from anothr page
    }.bind(this));

    //if we go away from the page by some link, when we come back we will need to add window.onresize again
    $(document).on("click", function (event) {
        if ($(event.target).attr("href")) this.focusExecuted = false;
        $(window).off("resize", this.clearTiles(false)); //just in case
        $(window).on("resize", this.clearTiles(false)); //when an element with href is pressed, but page hasn't been reloaded
    }.bind(this));
};

//Thumbnail--------------------------------------------------------------------------------------------------------
function Thumbnail (parent, data, config, dataUrl) {
    this.parent = parent;
    this.data = data || {
        img: undefined,
        specs:{}
    };
    this.dataUrl = dataUrl;
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

    var img = $("<img src=" + (this.data.img || "'images/defaultPic.gif'") + " class='thumbnail-img'>");
    //make the image clickable
    if (mode === "edit") {
        img.hover(function () {
            $(this).css({
                cursor: "pointer"
            })
        });
        img.on("click", this.chooseImage.bind(this));
    };

    var button = $("<button type='button' class='btn btn-default details-button' data-toggle='modal' data-target='details'>" + (mode === "view"? "Подробнее>>" : "Редактировать>>") + "</button>");
    button.on("click", function (event) {
        self.details.render();
    });
    
    div.append(img);

    var fields = gatherItemsInOrder(config.showcase);
    for (var i = fields.length-1; i >= 0; i--) {
        if (this.data.specs[fields[i]]) {
            var p = $("<p>" + ((config.showcase[fields[i]].withTitle) ? (fields[i] + ": " + this.data.specs[fields[i]]) : (this.data.specs[fields[i]])) + "</p>");
            if (config.showcase[fields[i]].css) p.css(config.showcase[fields[i]].css(this.data));
            div.append(p);
        };
    };

    div.append(button);

    if (mode === "edit") col.on("contextmenu", this.showPopupMenu.bind(this));

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

    var self = this;
    makeFileSaveRequest("/savefile?id=" + this.data._id, target.text(), function (err) {
        if (err) alert (err.message);
        getData(self.dataUrl, createContent);
    });
};

Thumbnail.prototype.showDirList = function (event) {
    makeListRequest("/list?dir=images" , (err, list) => {
        if (err) alert(err.messge);
        
        var files = {};
        for (var i = 0; i < list.length; i++) {
            files[list[i]] = [this.chooseImageOnServer.bind(this), this.showDirPopupMenu.bind(this)];
        };
        
        var menu = new PopupMenu(this.elem, event, files, true);
        menu.elem.addClass("dir-list");
    });
};

Thumbnail.prototype.showDirPopupMenu = function (event) {
    $(".popup-menu[unremovable='false']").remove();

    var target = findTarget($(event.target), "popup-button");
    if (!target) return;
    
    this.selectedImage = target.text();
    
    var menu = new PopupMenu(this.elem, event, {
        "Посмотреть": [this.showImage.bind(this)],
        "Удалить": [this.deleteImage.bind(this)]
    });
};

Thumbnail.prototype.showPopupMenu = function (event) {
    var target = findTarget($(event.target), "thumbnail thumbnail-img details-button popup-menu");
    if (!target) {
        $(".popup-menu").remove();
        return;
    };

    if (!target.hasClass("popup-menu")) $(".popup-menu").remove();

    if (target.hasClass("thumbnail")) {
        var popupMenu = new PopupMenu(this.elem, event, {
            "Удалить товар": [this.delete.bind(this)]
        });
    } else if (target.hasClass("thumbnail-img")) {
        var popupMenu = new PopupMenu(this.elem, event, {
            "Загрузить новое изображение": [this.chooseImage.bind(this)],
            "Выбрать изображение на сервере": [this.showDirList.bind(this)]
        });
    } else if (target.hasClass("details-button")) {
        return;
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

Thumbnail.prototype.delete = function (event) {
    var self = this;
    makeDBDelRequest("/dbdel?db=Commodity&id=" + this.data._id, function (err) {
        if (err) alert (err.message);
        getData(self.dataUrl, createContent);
    });
};

//Edit switch----------------------------------------------------------------------------------------------------------
function EditSwitch(parent) {
    this.parent = parent;

    this.elem = $("<button type='button' class='btn btn-default'>Редактировать</button>");
    //this.elem.appendTo(document.body);
    this.elem.appendTo($(".main-content"));

    this.elem.css({
        float: "right",
        margin: "5px"
        /*position: "absolute",
        top: "95%",
        left: "90%"*/
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
        this.elem.text("Редактировать");
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
            getData(storedData.url, createContent);//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    }, function (err, data) {
        if (err) {
            if (err.message === "Документ уже существует") alert("Яна, категория с таким имененм у тебя уже есть");
            else alert(err.message);
            return;
        }

        $(".side-menu").append("\
            <li class='menu-button'>\
                <a role='presentation' href='" + data.url + "'>" + data.name + "</a>\
            </li>\
        ");
    });
    dialog.render();
};

//Popup menu-----------------------------------------------------------------------------------------------------------
function PopupMenu(parent, invokingEvent, items, unremovable) { //unremovable means this popup should not be deleted on popup on itself
    this.parent = parent;
    this.elem = $("<div class='popup-menu'" + (unremovable ? "unremovable='true'" : "unremovable='false'") + "></div>");
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

export {storedConfig, storedData, socket, parseConfig, thumbnails, Thumbnails};