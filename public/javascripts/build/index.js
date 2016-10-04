/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	//import headMenuListener from "./headMenu";
	var headMenuListener = __webpack_require__(1);

	headMenuListener();

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	//export default function headMenuListener () {
	module .exports = function headMenuListener () {
	    
	    $(document).ready(function () {
	        $("#signin, #signup").on("click", function (event) {
	            event.preventDefault();

	            var target = findTarget($(event.target), "signin signup");
	            if (!target) return;
	            
	            showAuthWindow(target.attr("id"));
	        });
	        
	        $("#signout").on("click", function (event) {
	            event.preventDefault();

	            var target = findTarget($(event.target), "signout");
	            if (!target) return;

	            makeAuthorizationRequest("/signout", null, function (err) {
	                if (err) alert (err.message);
	                else window.location.href = "/";
	            });
	        });

	        //Close all popups and modals, if there are any-------------------------------------------------------------------------------------------------------------------------------
	        $(document.documentElement).on("click keydown", function (event) {
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
	};

/***/ }
/******/ ]);