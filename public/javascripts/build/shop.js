"use strict";

class SockConnection {
    constructor (url) {
        this.url = url;
        this.callbacks = {
            searchResult: null
        }
    };
    
    connect () {
        this.connection = new SockJS(this.url);
        //this.connection.addEventListener("connection", this.setHandlers);

        var self = this;
        this.connection.onopen = function() {
            //console.log(self.connection.readyState);
            //self.connection.send("test");
        };

        this.connection.onmessage = function (event) {
            var json = JSON.parse(event.data),
                data = json.data,
                type = json.type,
                done = json.done,
                key = json.key;

            if (!self.callbacks[type]) return;

            if (data === "Error") self.callbacks[type](new Error(type + " error"));
            else self.callbacks[type](null, data, done, key);
        };
    };

    send (data) {
        this.lastRequest = data;
        this.connection.send(data);
    };

    setHandlers () {

    }
};
"use strict";

//Details---------------------------------------------------------------------------------------------------------------
function Details (parent) {
    if (!parent.data) return;
    
    ModalWindow.call(this, false);

    this.parent = parent;

    this.elem.attr("id", "details");
    this.elem.css({
        background: "#079",
        padding: "0px"
    });
};

Details.prototype = Object.create(ModalWindow.prototype);
Details.prototype.constructor = Details;

Details.prototype.render = function () {
    var self = this;

    if (!this.elem.html()) {
        this.content = $("<form></form>");
        
        this.createContent();
        
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

            this.content.append(cancelButton);
            this.content.append(addButton);
            this.content.append(saveButton);
        };
    };
    
    this.content.on("submit", this.submit.bind(this));
    this.content.on("click", ".btn", this.editButtonClick.bind(this));

    this._render(this.content);
};

Details.prototype.createContent = function () {
    this.elem.find("#details__content").remove();
    
    var panel = $("<div class='panel panel-default' id='details__content'></div>");
    this.table = $("<table class='table'><tbody></tbody></table>");

    //for some reason properties are read in the opposite order
    var items = gatherItemsInOrder(this.parent.data.specs);

    for (var i = items.length - 1; i >= 0; i--) {
        this.addField(this.table.find("tbody"), {key: items[i], val: this.parent.data.specs[items[i]]});
    };

    panel.append(this.table);
    this.content.prepend(panel);
};

Details.prototype.editButtonClick = function (event) {
    var target = $(event.target);
    target = findTarget(target, "btn");
    if (!target) return;

    switch (target.attr("id")) {
        case "add-button":
            this.addField(this.table.find("tbody"));
            break;
        case "rm-button":
            this.removeField(this.table.find("tbody"), target.attr("num"));
            break;
        case "cancel-button":
            this.createContent();
            this.close();
            break;
    };
    
    target.blur();
};

Details.prototype.addField = function (container, value) {
    if (mode === "edit") {
        container.append(
            "<tr>\
                <td><input name='key' value='" + (value ? value.key : "") + "'></td>\
                <td><input name='val' value='" + (value ? value.val : "") +"'></td>\
                <td><input type='button' class='btn' id='rm-button' num='" + container.children().length + "' value='Удалить'></td>\
            </tr>");
    } else {
        container.append(
            "<tr>\
                <td>" + (value ? value.key : "") + "</td>\
                <td>" + (value ? value.val : "") + "</td>\
            </tr>");
    };
};

Details.prototype.removeField = function (container, num) {
    container.children().eq(+num).remove();
    
    for (var i = +num; i < container.children().length; i++) {
        container.children().eq(i).find("input").attr("num", i);
    };
};

Details.prototype.submit = function (event) {
    var form = $(event.target);

    var self = this;
    makeDBSaveRequest("/dbsave?db=Commodity&id=" + this.parent.data._id, form.serializeArray(), function (err) {
        if (err) alert (err.message);
        getData(self.parent.dataUrl, createContent);
    });

    this.close();

    event.preventDefault();
};

//Dialog-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
//createData - function to create data, if data to be submitted doesn't comply with data in form
//callback - to be called after a data is saved to a database
function Dialog (items, db, createData, callback) {
    var fakeParent = {
        data: {
            _id: null,
            specs: items
        }
    };

    Details.call(this, fakeParent);

    this.db = db;
    this.createData = createData;
    this.callback = callback;
};

Dialog.prototype = Object.create(Details.prototype);
Dialog.prototype.constructor = Dialog;

Dialog.prototype.submit = function (event) {
    var self = this;
    var form = $(event.target);

    if (this.createData) var formData = this.createData(form);
    else var formData = form.serializeArray();

    if (!formData.url && storedData) formData.url = storedData.url;
    makeDBSaveRequest("/dbsave?db=" + this.db + "&id=" + this.parent.data._id, formData, function (err) {
        if (err) {
            if (self.callback) self.callback(err);
            else alert (err.message);
            return;
        }

        if (formData) {
            getData(formData.url, function () {
                createContent();
                if (self.callback) self.callback(null, formData);

                if (self.db === "Category") {
                    sideMenuActive($(".side-menu a[href='" + formData.url + "']"));
                };
            });
        };
    });

    this.close();

    event.preventDefault();
};

//Authentification Window----------------------------------------------------------------------------------------------------------------------------------------------------
function AuthWindow (type) {
    ModalWindow.call(this, true);
    
    this.elem.attr("id", "authentification");
    this.elem.css({
        background: "#fff",
        padding: "5px",
        border: "1px solid #ccc",
        borderRadius: "5px"
    });

    this.type = type;
};

AuthWindow.prototype = Object.create(ModalWindow.prototype);
AuthWindow.prototype.constructor = AuthWindow;

AuthWindow.prototype.render = function () { 
    this.form = $(
    "<form>\
        <div class='form-group'>\
            <label for='username' class='sr-only'>Имя пользователя</label>\
                <input type='text' class='form-control' name='username' id='username' placeholder='Имя пользователя'>\
        </div>\
        <div class='form-group'>\
            <label for='password' class='sr-only'>Пароль</label>\
                <input type='password' class='form-control' name='password' id='password' placeholder='Пароль' autocomplete='off'>\
        </div>\
    </form>");
    
    this.form.css({
        minWidth: 300
    });

    var button = $("<button type='submit' class='btn btn-primary' id='auth-button'>" + ((this.type === "signin") ? "Войти" : (this.type === "signup") ? "Регистрация" : "") + "</button>");
    button.css({
        margin: "0 10px 10px 10px",
        float: "right"
    });
    this.form.append(button);

    this.form.on("submit", this.submit.bind(this));
    
    this._render(this.form);
};

AuthWindow.prototype.submit = function (event) {
    makeAuthorizationRequest("/" + this.type, this.form, function (err) {
        if (err) alert (err.message);
        else {
            ModalWindow.prototype.close();
            location.reload();
        };
    });

    event.preventDefault();
};

//Modal window---------------------------------------------------------------------------------------------------------------------------------------------------------------
//romove shows if the window should be removed whe deleted or jast detach
function ModalWindow () {
    this.elem = $("<div class='mod'></div>");
    this.elem.css({
        zIndex: 3
    });
    
    this.focusExecuted = false;
};

ModalWindow.prototype._render = function (content) {
    this.close();
    
    this.preventScrolling(true);

    if (!this.elem.html()) {
        if (content) this.elem.append(content);

        this.closeButton = $("<div></div>");
        this.closeButton.css({
            width: "20px",
            height: "20px",
            float: "right"
        });
        var closeImg = $("<img src='/images/gtk-close.png'>");
        closeImg.css({
            width: "100%",
            height: "100%"
        });
        this.closeButton.append(closeImg);
        this.closeButton.hover(function () {
            $(this).css({
                cursor: "pointer"
            })
        });

        var clearFix = ($("<div class='clearfix'></div>"));

        this.elem.prepend(this.closeButton);
        clearFix.insertAfter(this.closeButton);

        this.elem.css({
            position: "fixed"
        });
    };

    this.elem.css({
        visibility: "hidden" //To prevent scampering of a modal across the window, visibility is restored after positioning
    });
    $(document.body).append(this.elem);

    this.closeButton.on("click", this.close.bind(this));

    $(window).on("resize", this.position.bind(this));
    
    //Crazy firefox' feature that js isn't executed again, when a page is returned to, but window.onresize is lost, when a page is left
    //So I listen to document.onfocus and add window.onresize again
    $(document).on("focus", function () {
        if (this.focusExecuted) return;

        this.focusExecuted = true;
        
        $(window).off("resize", this.position.bind(this)); //just in case
        $(window).on("resize", this.position.bind(this)); //when comming back from anothr page
    }.bind(this));

    //if we go away from the page by some link, when we come back we will need to add window.onresize again
    $(document).on("click", function (event) {
        if ($(event.target).attr("href")) this.focusExecuted = false;
        $(window).off("resize", this.position.bind(this)); //just in case
        $(window).on("resize", this.position.bind(this)); //when an element with href is pressed, but page hasn't been reloaded
    }.bind(this));

    this.position();
};

//set position when the window is resized
ModalWindow.prototype.position = function () {
    var self = this;

    setTimeout(function () { //To prevent multiple executions
        var win = $(window);

        if (self.elem.width() > win.width()) {
            self.elem.css({
                position: "absolute",
                top: win.scrollTop() + 30 + "px",
                left: "0px"
            });
        } else if (self.elem.height()+30 > win.height()) {
            self.elem.css({
                position: "absolute",
                top: win.scrollTop() + "px",
                left: win.scrollLeft() + win.width()/2 - self.elem.width()/2 + "px",
            });
        } else {
            self.elem.css({
                position: "fixed",
                top: "30px",
                left: win.scrollLeft() + win.width()/2 - self.elem.width()/2 + "px",
            });
        };

        self.elem.css({
            visibility: "visible"
        });
    }, 0);
};

ModalWindow.prototype.close = function () {
    $(".mod").remove();
    
    this.preventScrolling(false);
};

ModalWindow.prototype.preventScrolling = function (prevent) {
    var doc = $(document);
    
    $(document.body).css({
        overflow: prevent ? "hidden" : "visible"
    });
    
    if (prevent) {
        var background = $("<div class='dim-background'></div>");
        background.css({
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: doc.height(),
            background: "rgba(0,0,0,.5)",
            zIndex: 2
        });
        $(document.body).append(background);
    } else {
        $(".dim-background").remove();
    }
};
"use strict";

//findTarget(initial target from event.target, class or id to define the target, element inside the target that will be returned instead of target - optional)
function findTarget(target, criteria, tag) {
    criteria = criteria.split(" ");

    do {
        for (var i = 0; i < criteria.length; i++) {
            if ((target.hasClass(criteria[i])) || (target.attr("id") === criteria[i])) {
                if (tag) return target.children(tag);
                else return target;
            };
        };
        target = target.parent();
    } while (target.length);
};

//for some reason sometimes properties are read in the opposite order
function gatherItemsInOrder(obj) {
    var items = [];
    for(var item in obj){
        items.push(item);
    };
    return items;
};
"use strict";

//DB------------------------------------------------------------------------------------------------------------------------------------------------------------
function makeDBSearchRequest (reqStr, callback) {
    $.ajax({
        url: reqStr,
        type: "GET",
        dataType: "json"
    })
    .done(function (json) {
        callback(null, json);
    })
    .fail(function (xhr, status, err) {
        callback(err);
    });
};

function makeDBSaveRequest (reqStr, data, callback) {
    $.ajax({
        url: reqStr,
        type: "POST",
        data: data,
        statusCode:{
            200: function () {
                callback(null)
            },
            403: function (jqXHR) {
                callback(JSON.parse(jqXHR.responseText));
            }
        }
    });
};

function makeDBDelRequest (reqStr, callback) {
    $.ajax({
        url: reqStr,
        type: "POST",
        statusCode:{
            200: function () {
                callback(null)
            },
            404: function (jqXHR) {
                callback(JSON.parse(jqXHR.responseText));
            }
        }
    });
};

//Files--------------------------------------------------------------------------------------------------------------------------------------------------------
function makeFileSaveRequest(reqStr, file, callback) {
    $.ajax({
        url: reqStr,
        type: "POST",
        data: file,
        headers: {
            "x-file-name": file.name || file //file may be a file or a string with a file name
        },
        processData: false,
        contentType: false,
        statusCode:{
            200: function () {
                callback(null)
            },
            403: function (jqXHR) {
                callback(JSON.parse(jqXHR.responseText));
            }
        }
    });
};

function makeFileDeleteRequest(reqStr, callback) {
    $.ajax({
        url: reqStr,
        type: "GET"
    })
    .done(function () {
        callback();
    })
    .fail(function (xhr, status, err) {
        callback(err);
    });
}

function makeListRequest(reqStr, callback) {
    $.ajax({
        url: reqStr,
        type: "GET",
        dataType: "json"
    })
    .done(function (json) {
        callback(null, json);
    })
    .fail(function (xhr, status, err) {
        callback(err);
    });
};

//Registration and authorization------------------------------------------------------------------------------------------------------------------------------------
function makeAuthorizationRequest (reqStr, form, callback) {
    $.ajax({
        url: reqStr,
        type: "POST",
        data: form ? form.serialize() : null,
    })
    .done(function (json) {
        callback(null, json);
    })
    .fail(function (xhr, status, err) {
        callback(JSON.parse(xhr.responseText));
    });;
};
"use strict";

function makeSearchRequest(request, data, onSearchEnd, onSearchResult) {
    var key = Math.random();

    socket.callbacks.searchResult = function (err, data, done, resultKey) {
        if (data === "searchComplete") {
            onSearchEnd(null, null);
            return;
        };

        if (err) {
            alert("Ошибка поиска. Выведены не все результаты.");
            socket.callbacks.searchResult = null;
            return;
        };

        if (!data) {
            alert("Ничего не найдено");
            return;
        };

        if (resultKey !== key) return;

        onSearchResult(data, done);
    };

    socket.send(JSON.stringify({
        request: "/search?" + request,
        data: data,
        key: key
    }));
};
"use strict";

(function (argument) {
    
    $(document).ready(function () {
        $("#signin, #signup").on("click", function (event) {
            event.preventDefault();

            var target = findTarget($(event.target), "signin signup");
            if (!target) return;
            
            showAuthWindow(target.attr("id"));
        });
        
        $("#signout").on("click", function (event) {
            event.preventDefault();

            var target = findTarget($(event.target), "signout");
            if (!target) return;

            makeAuthorizationRequest("/signout", null, function (err) {
                if (err) alert (err.message);
                else window.location.href = "/";
            });
        });

        //Close all popups and modals, if there are any-------------------------------------------------------------------------------------------------------------------------------
        $(document.documentElement).on("click keydown", function (event) {
            if (event.keyCode && event.keyCode !== 27) return;

            if (findTarget($(event.target), "mod")) return;

            //close image preview and popups
            if(!findTarget($(event.target), "popup-button") || event.keyCode === 27) {
                $("#image-preview").remove();
                $(".popup-menu").detach();
            };
            
            //if click is not on a details button, close all details
            if(!findTarget($(event.target), "details-button edit-button rm-button signin signup") || event.keyCode === 27) {
                ModalWindow.prototype.close();
            };
        });
    });
    
    function showAuthWindow(id) {
        var authWindow = new AuthWindow(id);
        authWindow.render();
    };
})();
"use strict";

(function () {

    $(document).ready(function () {

        $(".side-menu").on("contextmenu", ".menu-button", menuButtonClick);

    });

    function menuButtonClick (event) {
        if (findTarget($(event.target), "popup-menu")) return;

        $(".popup-menu").remove();

        if (mode !== "edit") return;

        var popupMenu = new PopupMenu($(this), event, {
            "Удалить категорию": [deleteCategory.bind($(this))]
        });

        event.preventDefault();
    }

    function deleteCategory() {
        var self = this;

        makeDBDelRequest("/dbdel?db=Category&name=" + this.find("a").text(), function (err) {
            if (err) {
                alert (err.message);
                return;
            };
            self.remove();
        });
    };

})();

function sideMenuActive(target) {
    $(".side-menu > .menu-button").removeClass("active");
    target.parent().addClass("active");
    target.blur();
}
"use strict";

var mode = "view";

var thumbnails,
    storedData, //data and configare not necesarily needed to be reloaded on every getData
    storedConfig, //data and configare not necesarily needed to be reloaded on every getData
    searchPanel;

var socket = new SockConnection(window.location.origin + "/sock");
socket.connect();

$(document).ready(function () {
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
"use strict";

//SearchPanel----------------------------------------------------------------------------------------------------------------------
function SearchPanel(options) {
    this.elem = $(".search-panel");
    this.toggleButton = $(".search-button");
    this.form = this.elem.find("form");
    this.input = this.elem.find("#search-input");

    this.setEvents();

    this.popups = {};
    if (options.popups) {
        for (var i = 0; i < options.popups.length; i++) {
            this.popups[options.popups[i]] = new SearchPanelPopupControl(options.popups[i], this.elem);
        };
    };
};

SearchPanel.prototype.setEvents = function () {

    this.toggleButton.on("click", this.toggle.bind(this));

    $(document.documentElement).on("keydown", this, function (event) {
        if (event.keyCode === 70 && event.ctrlKey && event.shiftKey) event.data.toggle();
    });

    this.elem.on("click", this.hidePopups.bind(this));

    $(".search-panel__hide-button").on("click", this.toggle.bind(this));

    this.form.on("submit", this.submit.bind(this));

};

SearchPanel.prototype.unsetEvents = function () {
    $(document.documentElement).off("click keydown", this.hide);
};

SearchPanel.prototype.toggle = function () {
    var self = this;

    this.elem.toggleClass("zero-width");

    if (!this.elem.hasClass("zero-width")) {
        setTimeout(function () {
            $(document.documentElement).on("click keydown", self, self.hide);
        }, 0);
    } else {
        this.hidePopups()
        this.unsetEvents();
    };
};

SearchPanel.prototype.hide = function (event) {
    var target = findTarget($(event.target), "search-panel search-panel__popup-panel");
    if (target) return;

    var self = event.data;

    if (event.keyCode && event.keyCode !== 27) return;

    self.toggle();
    self.hidePopups(event);
};

SearchPanel.prototype.hidePopups = function (event) {
    //if (event && $(event.target).closest(".search-panel__control-popup").length) return;
    if (event && findTarget($(event.target), "search-panel__control-popup search-panel__popup-panel")) return;

    for (let i in this.popups) {
        this.popups[i].hide();
    };
};

SearchPanel.prototype.submit = function (event) {
    var self = this;

    if (event) event.preventDefault();

    var request = this.form.serialize();
    
    if (!this.input.val().length) return;

    var searchData = {};
    for (let popup in this.popups) {
        searchData[popup] = this.popups[popup].getData();
    };
    
    var config,
        data;

    async.parallel([
        function (callback) {
            if (!storedConfig) makeDBSearchRequest("/dbsearch?db=Config", callback);
            else callback();
        },
        function (callback) {
            makeSearchRequest(request, searchData, callback, self.showSearchResult);
        }
    ], (function (err, results) {
        if (event) this.toggle();
        
        if (results[0]) {
            storedConfig = config = parseConfig(results[0][0]);
        };
        
        //createContent(null, config || storedConfig);
        if (thumbnails) {
            thumbnails.clear();
            thumbnails.data.url = "search";
        };

        socket.send(JSON.stringify({
            request: "/searchResults"
        }));
    }).bind(this));
};

SearchPanel.prototype.showSearchResult = function (data, done) {
    if (!thumbnails) {
        thumbnails = new Thumbnails("#commodity-list", storedData, storedConfig);
        thumbnails.data.url = "search";
    }
    thumbnails.add(data, done);
}

//SearchPanelPopupControl-------------------------------------------------------------------------------------------------------
function SearchPanelPopupControl (name, parent) {
    this.elem = $("<div class='search-panel__popup'></div>");
    this.name = name;
    this.parent = parent;

    this.create();
    this.render();

    Object.defineProperty(this, "data", {
        get: function () {
            this.body.submit();
            return this._data;
        }
    });
};

SearchPanelPopupControl.prototype.create = function () {
    var self = this;

    this.button = $(
        '<div class="search-panel__control-popup">\
            <p class="search-panel__control-popup__text">' + this.name + '</p>\
            <span class="glyphicon glyphicon-chevron-down search-panel__control-popup__icon" aria-hidden="true"></span>\
        </div>');

    this.body = $(
        "<form class='search-panel__popup-panel zero-display'>\
            <div class='row'></div>\
        </form>");

    this.getValues(function (err, values) {
        let col = createCol();

        let i = 1;
        for (var value in values) {
            col.append("<label class='checkbox'><input type='checkbox' name='" + value + "'>" + value + "</label>");
            if (i++ % 20 === 0) col = createCol();
        };
        self.bodyWidth = Math.ceil(i/20)*250;
        self.body.css({
            width: self.bodyWidth + "px"
        });
        $(".col").addClass("col-xs-" + (12/Math.ceil(i/20)));

        $(window).on("resize", self.handleBodySize.bind(self));

        function createCol() {
            let row = self.body.find(".row"),
                col = $("<div class='col'></div>");
            row.append(col);
            return col;
        };
    });

    this.elem.append(this.button);
    //this.elem.append(this.body);
    $(document.body).append(this.body);

    this.setEvents();
};

SearchPanelPopupControl.prototype.getValues = function (callback) {
    makeDBSearchRequest("/dbsearch?db=Commodity&field=specs." + this.name, callback);
};

SearchPanelPopupControl.prototype.setEvents = function () {
    this.button.on("click", this.toggle.bind(this));
    this.body.on("click", this.hide.bind(this));
};

SearchPanelPopupControl.prototype.render = function () {
    this.parent.append(this.elem);
};

SearchPanelPopupControl.prototype.toggle = function () {
    this.body.toggleClass("zero-display");
    this.handleBodySize();
};

SearchPanelPopupControl.prototype.hide = function (event) {
    if (event && findTarget($(event.target), "col")) return;

    this.body.addClass("zero-display");
};

SearchPanelPopupControl.prototype.handleBodySize = function () {
    clearTimeout(this.handleBodySizeTimer);
    let self = this;

    this.handleBodySizeTimer = setTimeout(function () {
        let win = $(window);

        self.body.css({
            top: self.button.offset().top + self.button.outerHeight(),
            right: 0
        })

        if (self.body.position().top + self.body.height() > win.height()) {
            self.body.css({
                position: "absolute"
            })
        } else {
            self.body.css({
                position: "fixed"
            })
        };

        if (win.width() > self.bodyWidth) {
            self.body.css({
                width: self.bodyWidth + "px"
            });
        } else {
            self.body.css({
                width: win.width() + "px"
            });
        };
    }, 100);
};

SearchPanelPopupControl.prototype.getData = function () {
    this._data = this.body.serializeArray();
    return this._data;
};