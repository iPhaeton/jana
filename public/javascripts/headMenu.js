(function (argument) {
    
    $(document).ready(function () {
        $("#signin, #signup").on("click", function (event) {
            event.preventDefault();

            var target = findTarget($(event.target), "signin signup");
            if (!target) return;
            
            showAuthWindow(target.attr("id"));
        });

        //Close all popups and modals, if there are any-------------------------------------------------------------------------------------------------------------------------------
        $(document.body).on("click keydown", function (event) {
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