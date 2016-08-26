//SearchPanel----------------------------------------------------------------------------------------------------------------------
function SearchPanel(options) {
    this.elem = $(".search-panel");
    this.toggleButton = $(".search-button");

    this.setEvents();

    this.popups = {};
    if (options.popups) {
        for (var i = 0; i < options.popups.length; i++) {
            this.popups[i] = new SearchPanelPopupControl(options.popups[i], this.elem);
        };
    };
};

SearchPanel.prototype.setEvents = function () {

    this.toggleButton.on("click", this.toggle.bind(this));

    $(document.documentElement).on("keydown", this, function (event) {
        if (event.keyCode === 70 && event.ctrlKey && event.shiftKey) event.data.toggle();
    });

    this.elem.on("click", this.hidePopups.bind(this));

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
    var target = findTarget($(event.target), "search-panel");
    if (target) return;

    var self = event.data;

    if (event.keyCode && event.keyCode !== 27) return;

    self.toggle();
    self.hidePopups(event);
};

SearchPanel.prototype.hidePopups = function (event) {
    if (event && $(event.target).closest(".search-panel__control-popup").length) return;

    for (let i in this.popups) {
        this.popups[i].hide();
    };
};

//SearchPanelPopupControl-------------------------------------------------------------------------------------------------------
SearchPanelPopupControl = function (name, parent) {
    this.elem = $("<div class='form-group search-panel__popup'></div>");
    this.name = name;
    this.parent = parent;

    this.create();
    this.render();
};

SearchPanelPopupControl.prototype.create = function () {
    var self = this;

    this.button = $(
        '<div class="search-panel__control-popup">\
            <p class="search-panel__control-popup__text">' + this.name + '</p>\
            <span class="glyphicon glyphicon-chevron-down search-panel__control-popup__icon" aria-hidden="true"></span>\
        </div>');

    this.body = $("<div class='search-panel__popup-panel zero-display'></div>");

    this.getValues(function (err, values) {
        for (var value in values) {
            self.body.append("<input type='checkbox'>" + value);
        };
    });

    this.elem.append(this.button);
    this.elem.append(this.body);

    this.setEvents();
};

SearchPanelPopupControl.prototype.getValues = function (callback) {
    makeDBSearchRequest("/dbsearch?db=Commodity&field=specs." + this.name, callback);
};

SearchPanelPopupControl.prototype.setEvents = function () {
    this.button.on("click", this.toggle.bind(this));
};

SearchPanelPopupControl.prototype.render = function () {
    this.parent.append(this.elem);
};

SearchPanelPopupControl.prototype.toggle = function () {
    this.body.toggleClass("zero-display");
};

SearchPanelPopupControl.prototype.hide = function () {
    this.body.addClass("zero-display");
};