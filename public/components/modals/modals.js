"use strict";

import "./modals.css";

import {makeDBSaveRequest, makeAuthorizationRequest} from "./../../javascripts/ajaxClient";
import {findTarget, gatherItemsInOrder} from "./../../javascripts/axillaries";

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
        
        if (shop.mode === "edit") {
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
    if (shop.mode === "edit") {
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
        shop.getData(self.parent.dataUrl, shop.createContent);
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
    else {
        var formData = form.serializeArray();
        formData.url = "/dbsearch?db=Commodity&specs=specs.Категория:" + formData[3].value;
    }

    if (!formData.url && shop.storedData) formData.url = shop.storedData.url;
    makeDBSaveRequest("/dbsave?db=" + this.db + "&id=" + this.parent.data._id, formData, function (err) {
        if (err) {
            if (self.callback) self.callback(err);
            else alert (err.message);
            return;
        }

        if (formData) {
            shop.getData(formData.url, function () {
                shop.createContent();
                if (self.callback) self.callback(null, formData);

                if (self.db === "Category") {
                    shop.sideMenuActive($(".side-menu a[href='" + formData.url + "']"));
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

export {Details, Dialog, AuthWindow, ModalWindow};