//findTarget(initial target from event.targe, class or id to define the target, element inside the target that will be returned instead of target - optional)
function findTarget(target, criterion, tag) {
    do {
        if ((target.hasClass(criterion)) || (target.attr("id") === criterion)) {
            if (tag) return target.children(tag);
            else return target;
        };
        target = target.parent();
    } while (target.length);
};
