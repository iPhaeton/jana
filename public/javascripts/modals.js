//Details---------------------------------------------------------------------------------------------------------------
function Details (parent) {
    if (!parent.data) return;

    this.parent = parent;

    this.elem = $("<div id='details'></div>");
    this.elem.css({
        background: "#079",
        padding: "0px"
    });

    ModalWindow.call(this, this.elem);
};

Details.prototype = Object.create(ModalWindow.prototype);
Details.prototype.constructor = Details;

Details.prototype.render = function () {
    var self = this;

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

    this._render();
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

Details.prototype.close = function () {
    this._close(true);
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
//createData - function to create data, if data to be submitted doesn't comply with data if form
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

//Modal window---------------------------------------------------------------------------------------------------------------------------------------------------------------
//elem contains jQuery objects to be addded to ModalWindow
function ModalWindow (elem) {
    this.elem = elem;
    this.elem.addClass("mod");
};

ModalWindow.prototype._render = function () {
    this.elem.css({
        position: "fixed"
    });
    $(document.body).append(this.elem);
    this.elem.css({
        minWidth: this.elem.get(0).clientWidth + 2 + "px", //the width is a bit bigger than it should be to avoid moving of the lists when a display is narrower than the div
        padding: "0 0 1px 1px"
    });

    $(window).on("resize", this.position.bind(this));

    this.position();
};

//set position when the window is resized
ModalWindow.prototype.position = function () {
    this.elem.css({
        top: "10%",
        left: (window.pageXOffset || document.documentElement.scrollLeft) + (document.documentElement.clientWidth/2) - (this.elem.get(0).offsetWidth/2) + "px"
    });
};

ModalWindow.prototype._close = function (keepEvents) {
    if (keepEvents) $(".mod").detach();
    else $(".mod").remove();
    $(window).off("resize");
};