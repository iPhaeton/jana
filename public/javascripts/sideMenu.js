(function () {

    $(document).ready(function () {

        $(".side-menu").on("contextmenu", ".menu-button", function (event) {
            if (findTarget($(event.target), "popup-menu")) return;

            $(".popup-menu").remove();

            if (mode !== "edit") return;

            var popupMenu = new PopupMenu($(this), event, {
                "Удалить категорию": [deleteCategory.bind($(this))]
            });

            event.preventDefault();
        });

    });

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
