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

    if (this.elem.html()) {
        $(document.body).append(this.elem);
        return;
    };
    
    var content = this.createContent();

    this.elem.append(content);

    this._render();
};

Details.prototype.createContent = function () {
    var content = $("<form></form>");

    this.keyList = $("<ul class='list-group' allow-for-width='true'></ul>");
    this.valueList = $("<ul class='list-group' allow-for-width='true'></ul>");
    this.removeList = $("<ul class='list-group' allow-for-width='true'></ul>");

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
            return;
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

Details.prototype.submit = function (event) {
    var form = $(event.target);
    
    makeDBSaveRequest("/dbsave?db=Commodity&id=" + this.parent.data._id, form.serializeArray(), function (err) {
        if (err) alert (err.message);
        getData(data.url, createContent);
    });

    this.close();

    event.preventDefault();
};

//Dialog-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
//createData - function to create data, if data to be submitted doesn't comply with data in form
//callback - to be called after a data is saved to a database
Dialog = function (items, db, createData, callback) {
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

    if (!formData.url) formData.url = data.url;
    makeDBSaveRequest("/dbsave?db=" + this.db + "&id=" + this.parent.data._id, formData, function (err) {
        if (err) alert (err.message);
        getData(formData.url, function () {
            createContent();
            if (self.callback) self.callback(formData);
        });
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
    })

    var button = $("<button type='submit' class='btn btn-primary' id='auth-button'>" + ((this.type === "signin") ? "Войти" : (this.type === "signup") ? "Регистрация" : "") + "</button>");
    button.css({
        margin: "0 10px 10px 10px",
        float: "right"
    });
    this.form.append(button);
    
    this.elem.append(this.form);

    this.form.on("submit", this.submit.bind(this));
    
    this._render();
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
function ModalWindow (remove) {
    this.elem = $("<div class='mod' remove=" + remove + "></div>");
    
    this.focusExecuted = false;
};

ModalWindow.prototype._render = function () {
    this.close();

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

    this.elem.prepend(closeButton);
    clearFix.insertAfter(closeButton);

    this.elem.css({
        position: "fixed"
    });
    $(document.body).append(this.elem);

    var allowForWidth = $("[allow-for-width='true']");
    if (allowForWidth.length) {
        var requiredWidth = 0;
        for (var i = 0; i < allowForWidth.length; i++) {
            requiredWidth += allowForWidth.eq(i).width();
        };
        this.elem.css({
            minWidth: requiredWidth + 2 + "px", //the width is a bit bigger than it should be to avoid moving of the lists when a display is narrower than the div
            padding: this.elem.css("padding") ? this.elem.css("padding") : "0 0 1px 1px"
        });
    } else {
        this.elem.css({
            minWidth: this.elem.get(0).clientWidth + 2 + "px", //the width is a bit bigger than it should be to avoid moving of the lists when a display is narrower than the div
            padding: this.elem.css("padding") ? this.elem.css("padding") : "0 0 1px 1px"
        });
    };

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
    if (this.elem.width() > $(document.body).width()) {
        this.elem.css({
            position: "absolute",
            top: "10%",
            left: "0px"
        });

        //add a div to expand the width of the window to accomodate the whole modal window
        if (!$(".width-expander").length) {
            var widthExpander = $("<div class='width-expander'></div>");
            widthExpander.css({
                width: this.elem.width() + "px"
            });
            $(document.body).append(widthExpander);
        };
    } else {
        $(".width-expander").remove();

        this.elem.css({
            position: "fixed",
            top: "10%",
            left: (window.pageXOffset || document.documentElement.scrollLeft) + (document.documentElement.clientWidth/2) - (this.elem.get(0).offsetWidth/2) + "px",
        });
    };
};

ModalWindow.prototype.close = function () {
    var target = $(".mod");

    if (target.attr("remove")) $(".mod").remove();
    else $(".mod").detach();
    $(window).off("resize");
};