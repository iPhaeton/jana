var shop =
webpackJsonp_name_([3],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.sideMenuActive = exports.createContent = exports.getData = exports.Thumbnails = exports.parseConfig = undefined;
	
	var _headMenu = __webpack_require__(1);
	
	var _headMenu2 = _interopRequireDefault(_headMenu);
	
	var _ajaxClient = __webpack_require__(3);
	
	var _searchPanel = __webpack_require__(7);
	
	var _searchPanel2 = _interopRequireDefault(_searchPanel);
	
	var _axillaries = __webpack_require__(4);
	
	var _SockConnection = __webpack_require__(13);
	
	var _SockConnection2 = _interopRequireDefault(_SockConnection);
	
	var _sideMenu = __webpack_require__(15);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var searchPanel;
	
	//shop.storedData - data and configare not necesarily needed to be reloaded on every getData
	//shop.storedConfig - data and configare not necesarily needed to be reloaded on every getData
	$(document).ready(function () {
	    shop.mode = "view";
	
	    shop.socket = new _SockConnection2.default(window.location.origin + "/sock");
	    shop.socket.connect();
	
	    (0, _headMenu2.default)();
	    (0, _sideMenu.sideMenuListener)();
	
	    var editPanel = new EditPanel();
	
	    $(document.body).css({
	        height: $(window).height()
	    });
	
	    searchPanel = new _searchPanel2.default({
	        popups: ["Производитель"]
	    });
	
	    $(".side-menu").on("click", ".menu-button", function (event) {
	        var target = $(event.target);
	        target = (0, _axillaries.findTarget)(target, "menu-button", "a");
	        if (!target) {
	            event.preventDefault();
	            return;
	        };
	
	        (0, _sideMenu.sideMenuActive)(target);
	
	        getData(target.attr("href"), createContent);
	
	        event.preventDefault();
	    });
	});
	
	function getData(url, callback) {
	    if (url === "search") {
	        searchPanel.submit();
	        return;
	    }
	
	    var config, data;
	
	    __webpack_require__.e/* nsure */(4, function () {
	        var async = __webpack_require__(8);
	
	        async.parallel([
	        //get configuration
	        function (callback) {
	            (0, _ajaxClient.makeDBSearchRequest)("/dbsearch?db=Config", callback);
	        }, function (callback) {
	            (0, _ajaxClient.makeDBSearchRequest)(url, callback);
	        }], function (err, results) {
	            shop.storedConfig = config = parseConfig(results[0][0]);
	            shop.storedData = data = results[1];
	            data.url = url;
	
	            if (err) {
	                alert("Извините, проблема с базой данных");
	                return;
	            };
	
	            callback(data, config);
	        });
	    });
	};
	
	function createContent(data, config) {
	    //if called without any of the arguments, that argument is taken from the global variable
	    //data and config are stored in global variables when they are taken from the database
	    var data = data || shop.storedData,
	        config = config || shop.storedConfig;
	
	    if (!data && shop.thumbnails) {
	        shop.thumbnails.clear();
	    }
	    if (!config) return;
	
	    if (!shop.thumbnails) shop.thumbnails = new Thumbnails("#commodity-list", data, config);
	    shop.thumbnails.clear();
	    shop.thumbnails.build(data, config);
	    shop.thumbnails.render();
	};
	
	//parse the config object------------------------------------------------------------------------------------------
	function parseConfig(config) {
	    for (var field in config.showcase) {
	        if (config.showcase[field].css) {
	            config.showcase[field].css = new Function("data", config.showcase[field].css);
	        };
	    };
	
	    return config;
	};
	
	//Thumbnails-------------------------------------------------------------------------------------------------------
	function Thumbnails(elem, config) {
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
	
	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;
	
	    try {
	        for (var _iterator = this.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var doc = _step.value;
	
	            this.tiles.add(new Thumbnail(this, doc, this.config, this.data.url).elem);
	        }
	    } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	                _iterator.return();
	            }
	        } finally {
	            if (_didIteratorError) {
	                throw _iteratorError;
	            }
	        }
	    }
	
	    ;
	};
	
	Thumbnails.prototype.render = function () {
	    this.row = $("<div class='row'></div>");
	
	    var _iteratorNormalCompletion2 = true;
	    var _didIteratorError2 = false;
	    var _iteratorError2 = undefined;
	
	    try {
	        for (var _iterator2 = this.tiles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	            var tile = _step2.value;
	
	            this.row.append(tile);
	        }
	    } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                _iterator2.return();
	            }
	        } finally {
	            if (_didIteratorError2) {
	                throw _iteratorError2;
	            }
	        }
	    }
	
	    ;
	
	    this.elem.append(this.row);
	
	    this.clearTiles(true)();
	};
	
	Thumbnails.prototype.add = function (dataToAdd, done) {
	    if (!this.row) {
	        this.row = $("<div class='row'></div>");
	        this.elem.append(this.row);
	    };
	
	    var newThumbnail = new Thumbnail(this, dataToAdd, this.config || shop.storedConfig, "search");
	
	    this.tiles.add(newThumbnail.elem);
	    this.row.append(newThumbnail.elem);
	    this.clearTiles(true);
	
	    this.data.push(dataToAdd);
	    shop.storedData = this.data;
	
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
	    var _iteratorNormalCompletion3 = true;
	    var _didIteratorError3 = false;
	    var _iteratorError3 = undefined;
	
	    try {
	        for (var _iterator3 = this.tiles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	            var tile = _step3.value;
	
	            if (i % clearThis === 0) {
	                tile.addClass("first-in-a-row");
	            } else {
	                tile.removeClass("first-in-a-row");
	            };
	            i++;
	        }
	    } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion3 && _iterator3.return) {
	                _iterator3.return();
	            }
	        } finally {
	            if (_didIteratorError3) {
	                throw _iteratorError3;
	            }
	        }
	    }
	
	    ;
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
	        $(window).on("resize", this.clearTiles(false)); //when coming back from another page
	    }.bind(this));
	
	    //if we go away from the page by some link, when we come back we will need to add window.onresize again
	    $(document).on("click", function (event) {
	        if ($(event.target).attr("href")) this.focusExecuted = false;
	        $(window).off("resize", this.clearTiles(false)); //just in case
	        $(window).on("resize", this.clearTiles(false)); //when an element with href is pressed, but page hasn't been reloaded
	    }.bind(this));
	};
	
	//Thumbnail--------------------------------------------------------------------------------------------------------
	function Thumbnail(parent, data, config, dataUrl) {
	    var _this = this;
	
	    this.parent = parent;
	    this.data = data || {
	        img: undefined,
	        specs: {}
	    };
	    this.dataUrl = dataUrl;
	
	    __webpack_require__.e/* nsure */(2/* duplicate */, function (require) {/* WEBPACK VAR INJECTION */(function($) {
	        var Details = __webpack_require__(6).Details;
	
	        _this.details = new Details(_this);
	        var self = _this;
	
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
	                        css: +data.specs["В наличии"].split(" ")[0] ? {
	                            color: "#0f0"
	                        } : {
	                            color: "#f00"
	                        }
	                    }
	                }
	            };
	        };
	
	        var col = $("<div class='col-sm-6 col-md-4 col-lg-3'></div>");
	
	        var div = $("<div class='thumbnail'></div>");
	        div.css({
	            textAlign: "right"
	        });
	
	        var img = $("<img src=" + (_this.data.img || "'images/defaultPic.gif'") + " class='thumbnail-img'>");
	        //make the image clickable
	        if (shop.mode === "edit") {
	            img.hover(function () {
	                $(this).css({
	                    cursor: "pointer"
	                });
	            });
	            img.on("click", _this.chooseImage.bind(_this));
	        };
	
	        var button = $("<button type='button' class='btn btn-default details-button' data-toggle='modal' data-target='details'>" + (shop.mode === "view" ? "Подробнее>>" : "Редактировать>>") + "</button>");
	        button.on("click", function (event) {
	            self.details.render();
	        });
	
	        div.append(img);
	
	        var fields = (0, _axillaries.gatherItemsInOrder)(config.showcase);
	        for (var i = fields.length - 1; i >= 0; i--) {
	            if (_this.data.specs[fields[i]]) {
	                var p = $("<p>" + (config.showcase[fields[i]].withTitle ? fields[i] + ": " + _this.data.specs[fields[i]] : _this.data.specs[fields[i]]) + "</p>");
	                if (config.showcase[fields[i]].css) p.css(config.showcase[fields[i]].css(_this.data));
	                div.append(p);
	            };
	        };
	
	        div.append(button);
	
	        if (shop.mode === "edit") col.on("contextmenu", _this.showPopupMenu.bind(_this));
	
	        col.append(div);
	
	        //return col;
	        _this.elem = col;
	    
	/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(2)))});
	};
	
	Thumbnail.prototype.chooseImage = function (event) {
	    $("#uploadInput").trigger("click", [this.data._id]);
	};
	
	Thumbnail.prototype.chooseImageOnServer = function (event) {
	    var target = $(event.target);
	    target = (0, _axillaries.findTarget)(target, "popup-button");
	    if (!target) return;
	
	    var self = this;
	    (0, _ajaxClient.makeFileSaveRequest)("/savefile?id=" + this.data._id, target.text(), function (err) {
	        if (err) alert(err.message);
	        getData(self.dataUrl, createContent);
	    });
	};
	
	Thumbnail.prototype.showDirList = function (event) {
	    var _this2 = this;
	
	    (0, _ajaxClient.makeListRequest)("/list?dir=images", function (err, list) {
	        if (err) alert(err.messge);
	
	        var files = {};
	        for (var i = 0; i < list.length; i++) {
	            files[list[i]] = [_this2.chooseImageOnServer.bind(_this2), _this2.showDirPopupMenu.bind(_this2)];
	        };
	
	        var menu = new PopupMenu(_this2.elem, event, files, true);
	        menu.elem.addClass("dir-list");
	    });
	};
	
	Thumbnail.prototype.showDirPopupMenu = function (event) {
	    $(".popup-menu[unremovable='false']").remove();
	
	    var target = (0, _axillaries.findTarget)($(event.target), "popup-button");
	    if (!target) return;
	
	    this.selectedImage = target.text();
	
	    var menu = new PopupMenu(this.elem, event, {
	        "Посмотреть": [this.showImage.bind(this)],
	        "Удалить": [this.deleteImage.bind(this)]
	    });
	};
	
	Thumbnail.prototype.showPopupMenu = function (event) {
	    var target = (0, _axillaries.findTarget)($(event.target), "thumbnail thumbnail-img details-button popup-menu");
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
	
	    this.iframe.on("load", function () {
	        var img = this.iframe.contents().find("img");
	        if (img.width() > img.height() && img.width() > this.iframe.width()) {
	            $(img).css({
	                width: "100%"
	            });
	        } else if (img.height() > this.iframe.height()) {
	            $(img).css({
	                height: "100%"
	            });
	        };
	    }.bind(this));
	};
	
	Thumbnail.prototype.deleteImage = function (event) {
	    (0, _ajaxClient.makeFileDeleteRequest)("/delfile?dir=images&file=" + this.selectedImage, function (err) {
	        if (err) alert(err.message);
	        getData(data.url, createContent);
	    });
	};
	
	Thumbnail.prototype.delete = function (event) {
	    var self = this;
	    (0, _ajaxClient.makeDBDelRequest)("/dbdel?db=Commodity&id=" + this.data._id, function (err) {
	        if (err) alert(err.message);
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
	    if (shop.mode !== "edit") {
	        shop.mode = "edit";
	        this.elem.text("Просмотр");
	        //create an input for uploading an image for a thumbnail
	        if (!$("#uploadInput").length) this.createUploadInput();
	    } else {
	        shop.mode = "view";
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
	
	    uploadInput.on("click", function (event, id) {
	        callerId = id;
	    });
	
	    uploadInput.on("change", function (event) {
	        (0, _ajaxClient.makeFileSaveRequest)("/savefile?id=" + callerId, this.files[0], function (err) {
	            if (err) alert(err.message);
	            getData(shop.storedData.url, createContent); //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	        });
	    });
	};
	
	//Edit panel-----------------------------------------------------------------------------------------------------------
	function EditPanel() {
	    if ($(".main-content").attr("admin-mode") === "true") this.switch = new EditSwitch(this);
	
	    this.elem = $(".edit-panel");
	    this.elem.on("click", ".edit-button", this.buttonClick.bind(this));
	};
	
	EditPanel.prototype.buttonClick = function (event) {
	    var target = (0, _axillaries.findTarget)($(event.target), "edit-button");
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
	    if (this.elem.attr("hidden")) this.elem.removeAttr("hidden");else this.elem.attr("hidden", "true");
	};
	
	EditPanel.prototype.addCommodity = function () {
	    __webpack_require__.e/* nsure */(2/* duplicate */, function (require) {
	        var Dialog = __webpack_require__(6).Dialog;
	
	        var questionnaire = new Dialog({
	            "Категория": "Лыжи",
	            "Название": ""
	        }, "Commodity");
	
	        questionnaire.render();
	    });
	};
	
	EditPanel.prototype.addCategory = function () {
	    __webpack_require__.e/* nsure */(2/* duplicate */, function (require) {/* WEBPACK VAR INJECTION */(function($) {
	        var Dialog = __webpack_require__(6).Dialog;
	
	        var dialog = new Dialog({ "Категория": "" }, "Category", function (form) {
	            var formData = form.serializeArray();
	            return {
	                name: formData[1].value,
	                url: "/dbsearch?db=Commodity&specs=specs.Категория:" + formData[1].value,
	                position: $(".menu-button").length
	            };
	        }, function (err, data) {
	            if (err) {
	                if (err.message === "Документ уже существует") alert("Яна, категория с таким имененм у тебя уже есть");else alert(err.message);
	                return;
	            }
	
	            $(".side-menu").append("\
	            <li class='menu-button'>\
	                <a role='presentation' href='" + data.url + "'>" + data.name + "</a>\
	            </li>\
	        ");
	        });
	        dialog.render();
	    
	/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(2)))});
	};
	
	//Popup menu-----------------------------------------------------------------------------------------------------------
	function PopupMenu(parent, invokingEvent, items, unremovable) {
	    //unremovable means this popup should not be deleted on popup on itself
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
	
	    item.on("click", function (event) {
	        if (onclick) onclick(event);
	        event.preventDefault();
	        this.close();
	    }.bind(this));
	
	    item.on("contextmenu", function (event) {
	        if (oncontextmenu) oncontextmenu(event);
	        event.preventDefault();
	    }.bind(this));
	};
	
	PopupMenu.prototype.render = function (invokingEvent) {
	    var offset = this.parent.offset();
	    this.parent.append(this.elem);
	    this.elem.css({
	        position: "absolute",
	        left: invokingEvent ? invokingEvent.clientX - offset.left + $(window).scrollLeft() + "px" : (window.pageXOffset || document.documentElement.scrollLeft) + document.documentElement.clientWidth / 2 - this.elem.get(0).offsetWidth / 2 - offset.left + "px",
	        top: invokingEvent ? invokingEvent.clientY - offset.top + $(window).scrollTop() + "px" : "10%",
	        zIndex: "1"
	    });
	};
	
	PopupMenu.prototype.close = function () {
	    this.elem.detach();
	};
	
	exports.parseConfig = parseConfig;
	exports.Thumbnails = Thumbnails;
	exports.getData = getData;
	exports.createContent = createContent;
	exports.sideMenuActive = _sideMenu.sideMenuActive;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 7:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = SearchPanel;
	
	var _axillaries = __webpack_require__(4);
	
	var _ajaxClient = __webpack_require__(3);
	
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
	        this.hidePopups();
	        this.unsetEvents();
	    };
	};
	
	SearchPanel.prototype.hide = function (event) {
	    var target = (0, _axillaries.findTarget)($(event.target), "search-panel search-panel__popup-panel");
	    if (target) return;
	
	    var self = event.data;
	
	    if (event.keyCode && event.keyCode !== 27) return;
	
	    self.toggle();
	    self.hidePopups(event);
	};
	
	SearchPanel.prototype.hidePopups = function (event) {
	    //if (event && $(event.target).closest(".search-panel__control-popup").length) return;
	    if (event && (0, _axillaries.findTarget)($(event.target), "search-panel__control-popup search-panel__popup-panel")) return;
	
	    for (var i in this.popups) {
	        this.popups[i].hide();
	    };
	};
	
	SearchPanel.prototype.submit = function (event) {
	    var _this = this;
	
	    var self = this;
	
	    if (event) event.preventDefault();
	
	    var request = this.form.serialize();
	
	    if (!this.input.val().length) return;
	
	    var searchData = {};
	    for (var popup in this.popups) {
	        searchData[popup] = this.popups[popup].getData();
	    };
	
	    var config, data;
	
	    __webpack_require__.e/* nsure */(4, function () {
	        var async = __webpack_require__(8);
	
	        async.parallel([function (callback) {
	            if (!shop.storedConfig) (0, _ajaxClient.makeDBSearchRequest)("/dbsearch?db=Config", callback);else callback();
	        }, function (callback) {
	            __webpack_require__(11)(function (sockJSClient) {
	                var makeSearchRequest = sockJSClient.makeSearchRequest;
	                makeSearchRequest(request, searchData, callback, self.showSearchResult);
	            });
	        }], function (err, results) {
	            if (event) this.toggle();
	
	            if (results[0]) {
	                shop.storedConfig = config = shop.parseConfig(results[0][0]);
	            }
	            ;
	
	            //createContent(null, config || storedConfig);
	            if (shop.thumbnails) {
	                shop.thumbnails.clear();
	                shop.thumbnails.data.url = "search";
	            }
	            ;
	
	            shop.socket.send(JSON.stringify({
	                request: "/searchResults"
	            }));
	        }.bind(_this));
	    });
	};
	
	SearchPanel.prototype.showSearchResult = function (data, done) {
	    if (!shop.thumbnails) {
	        shop.thumbnails = new shop.Thumbnails("#commodity-list", shop.storedData, shop.storedConfig);
	        shop.thumbnails.data.url = "search";
	    }
	    shop.thumbnails.add(data, done);
	};
	
	//SearchPanelPopupControl-------------------------------------------------------------------------------------------------------
	function SearchPanelPopupControl(name, parent) {
	    this.elem = $("<div class='search-panel__popup'></div>");
	    this.name = name;
	    this.parent = parent;
	
	    this.create();
	    this.render();
	
	    Object.defineProperty(this, "data", {
	        get: function get() {
	            this.body.submit();
	            return this._data;
	        }
	    });
	};
	
	SearchPanelPopupControl.prototype.create = function () {
	    var self = this;
	
	    this.button = $('<div class="search-panel__control-popup">\
	            <p class="search-panel__control-popup__text">' + this.name + '</p>\
	            <span class="glyphicon glyphicon-chevron-down search-panel__control-popup__icon" aria-hidden="true"></span>\
	        </div>');
	
	    this.body = $("<form class='search-panel__popup-panel zero-display'>\
	            <div class='row'></div>\
	        </form>");
	
	    this.getValues(function (err, values) {
	        var col = createCol();
	
	        var i = 1;
	        for (var value in values) {
	            col.append("<label class='checkbox'><input type='checkbox' name='" + value + "'>" + value + "</label>");
	            if (i++ % 20 === 0) col = createCol();
	        };
	        self.bodyWidth = Math.ceil(i / 20) * 250;
	        self.body.css({
	            width: self.bodyWidth + "px"
	        });
	        $(".col").addClass("col-xs-" + 12 / Math.ceil(i / 20));
	
	        $(window).on("resize", self.handleBodySize.bind(self));
	
	        function createCol() {
	            var row = self.body.find(".row"),
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
	    (0, _ajaxClient.makeDBSearchRequest)("/dbsearch?db=Commodity&field=specs." + this.name, callback);
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
	    if (event && (0, _axillaries.findTarget)($(event.target), "col")) return;
	
	    this.body.addClass("zero-display");
	};
	
	SearchPanelPopupControl.prototype.handleBodySize = function () {
	    clearTimeout(this.handleBodySizeTimer);
	    var self = this;
	
	    this.handleBodySizeTimer = setTimeout(function () {
	        var win = $(window);
	
	        self.body.css({
	            top: self.button.offset().top + self.button.outerHeight(),
	            right: 0
	        });
	
	        if (self.body.position().top + self.body.height() > win.height()) {
	            self.body.css({
	                position: "absolute"
	            });
	        } else {
	            self.body.css({
	                position: "fixed"
	            });
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 13:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var SockConnection = function () {
	    function SockConnection(url) {
	        _classCallCheck(this, SockConnection);
	
	        this.url = url;
	        this.callbacks = {
	            searchResult: null
	        };
	    }
	
	    _createClass(SockConnection, [{
	        key: "connect",
	        value: function connect() {
	            var _this = this;
	
	            __webpack_require__.e/* nsure */(6, function () {
	                var SockJS = __webpack_require__(14);
	
	                _this.connection = new SockJS(_this.url);
	                //this.connection.addEventListener("connection", this.setHandlers);
	
	                var self = _this;
	                _this.connection.onopen = function () {
	                    //console.log(self.connection.readyState);
	                    //self.connection.send("test");
	                };
	
	                _this.connection.onmessage = function (event) {
	                    var json = JSON.parse(event.data),
	                        data = json.data,
	                        type = json.type,
	                        done = json.done,
	                        key = json.key;
	
	                    if (!self.callbacks[type]) return;
	
	                    if (data === "Error") self.callbacks[type](new Error(type + " error"));else self.callbacks[type](null, data, done, key);
	                };
	            });
	        }
	    }, {
	        key: "send",
	        value: function send(data) {
	            this.lastRequest = data;
	            this.connection.send(data);
	        }
	    }, {
	        key: "setHandlers",
	        value: function setHandlers() {}
	    }]);
	
	    return SockConnection;
	}();
	
	exports.default = SockConnection;
	;

/***/ },

/***/ 15:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	function sideMenuListener() {
	
	    $(document).ready(function () {
	
	        $(".side-menu").on("contextmenu", ".menu-button", menuButtonClick);
	    });
	
	    function menuButtonClick(event) {
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
	                alert(err.message);
	                return;
	            };
	            self.remove();
	        });
	    };
	};
	
	function sideMenuActive(target) {
	    $(".side-menu > .menu-button").removeClass("active");
	    target.parent().addClass("active");
	    target.blur();
	};
	
	exports.sideMenuListener = sideMenuListener;
	exports.sideMenuActive = sideMenuActive;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }

});
//# sourceMappingURL=shop.js.map