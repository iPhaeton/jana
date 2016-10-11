document.createElement( "showCase" );

require ("../../vendor/bower_components/picturefill/dist/picturefill.js");

import template from "./showCase.ejs";
$(".showcase__image").append(template({env: NODE_ENV}));