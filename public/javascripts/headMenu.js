(function (argument) {
    
    $(document).ready(function () {
        $("#signin, #signup").on("click", function (event) {
            var target = findTarget($(event.target), "signin signup");
            if (!target) return;
            
            showAuthWindow(target.attr("id"));
        });
    });
    
    function showAuthWindow(id) {
        var authWindow = new AuthWindow(id);
    };
    
})();