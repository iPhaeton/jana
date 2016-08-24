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
    this.button = $(
        '<div class="search-panel__control-popup" data-toggle="zero-display" data-for="#manufacturers">\
            <p class="search-panel__control-popup__text">' + this.name + '</p>\
            <span class="glyphicon glyphicon-chevron-down search-panel__control-popup__icon" aria-hidden="true"></span>\
        </div>');

    this.body = $(
        '<div id="manufacturers" class="search-panel__popup-panel zero-display">\
            <input type="checkbox"> Checkbox\
            <input type="checkbox"> Checkbox\
            <input type="checkbox"> Checkbox\
            <input type="checkbox"> Checkbox\
            <input type="checkbox"> Checkbox\
            <div class="clearfix"></div>\
        </div>');

    this.elem.append(this.button);
    this.elem.append(this.body);

    this.setEvents();
};

SearchPanelPopupControl.prototype.getValues = function () {
    
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