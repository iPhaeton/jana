"use strict";

//findTarget(initial target from event.target, class or id to define the target, element inside the target that will be returned instead of target - optional)
function findTarget(target, criteria, tag) {
    criteria = criteria.split(" ");

    do {
        for (var i = 0; i < criteria.length; i++) {
            if ((target.hasClass(criteria[i])) || (target.attr("id") === criteria[i])) {
                if (tag) return target.children(tag);
                else return target;
            };
        };
        target = target.parent();
    } while (target.length);
};

//for some reason sometimes properties are read in the opposite order
function gatherItemsInOrder(obj) {
    var items = [];
    for(var item in obj){
        items.push(item);
    };
    return items;
};

export {findTarget, gatherItemsInOrder};