var focusExecuted = false;

$(document).ready (function () {
    if (focusExecuted) return;

    focusExecuted = true;

    scaleImage();
    $(window).on("resize", scaleImage);
});

//Crazy firefox' feature that js isn't executed again, when a page is returned to, but window.onresize is lost, when a page is left
//So I listen to document.onfocus and add window.onresize again
$(document).on("focus", function () {
    if (focusExecuted) return;

    focusExecuted = true;

    scaleImage();
    $(window).on("resize", scaleImage);
});

$(document).on("click", function (event) {
    if ($(event.target).attr("href")) focusExecuted = false;
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