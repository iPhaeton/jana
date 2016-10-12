document.createElement( "showCase" );

require ("../../vendor/bower_components/picturefill/dist/picturefill.js");

import template from "./showCase.ejs";

$(".showcase__image").append(template({env: NODE_ENV}));

if (NODE_ENV === "production") {
    var pathMed = require("../../images/showcase_medium.jpg");
    var pathSmall = require("../../images/showcase_small.jpg");
} else {
    var pathMed = require("../../images/showcase_medium_t.jpg");
    var pathSmall = require("../../images/showcase_small_t.jpg")
};
var pathBig = require ("../../images/showcase_big.jpg");

$("#small").attr("srcset", pathSmall);
$("#med").attr("srcset", pathMed);
$("#big").attr("srcset", pathBig);