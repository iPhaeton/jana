"use strict";

import "./headMenuStyle.css";

import {makeAuthorizationRequest} from "./../../javascripts/ajaxClient";
import {findTarget} from "./../../javascripts/axillaries";

export default function headMenuListener () {
    
    $(document).ready(function () {
        //Require bootstrap.js
        if ($(window).width() < 768) {
            require.ensure([], () => {
                require("bootstrap");
            });
        } else {
            $(window).on("resize", () => {
                if ($(window).width() < 768) {
                    require.ensure([], () => {
                        require("bootstrap");
                    });
                };
            });
        };

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
                require.ensure ("../modals/modals", (require) => {
                    var ModalWindow = require("./../modals/modals").ModalWindow;
                    ModalWindow.prototype.close();
                });
            };
        });
    });
    
    function showAuthWindow(id) {
        require.ensure ("../modals/modals", (require) => {
            var AuthWindow = require("./../modals/modals").AuthWindow;
            var authWindow = new AuthWindow(id);
            authWindow.render();
        });
    };
};