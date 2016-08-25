//SearchPanel----------------------------------------------------------------------------------------------------------------------
function SearchPanel(options) {
    this.elem = $(".search-panel");
    this.toggleButton = $(".search-button");

    this.setEvents();

    if (options.popups) {
        for (var i = 0; i < options.popups.length; i++) {
            new SearchPanelPopupControl(options.popups[i], this.elem);
        };
    };
};

SearchPanel.prototype.setEvents = function () {
    this.toggleButton.on("click", this.toggle.bind(this));
};

SearchPanel.prototype.toggle = function () {
    this.elem.toggleClass("zero-width");
};

SearchPanel.prototype.toggleElemClass = function (event) {
    var target = $(this);
};

//SearchPanelPopupControl-------------------------------------------------------------------------------------------------------
SearchPanelPopupControl = function (name, parent) {
    this.elem = $("<div class='form-group'></div>");
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

    this.body = $("<div class='search-panel__body-popup zero-display'></div>");

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