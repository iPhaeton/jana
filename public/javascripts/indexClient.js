$(document).ready(function () {
    scaleImage();
    $(window).on("resize", function () { //maybe will help against the fact that  scaleImage works not every time, don't know how
        scaleImage();
    });
});

function scaleImage () {
    var image = $(".showcase__image > img"),
        win = $(window);

    if ((win.width() / (win.height())) >= 1.5) {
        image.removeClass("showcase__image__mobile");
        image.addClass("showcase__image__desktop");
        image.height("auto");
    } else {
        image.removeClass("showcase__image__desktop");
        image.addClass("showcase__image__mobile");
        image.height(win.height() - 100);
    };
};