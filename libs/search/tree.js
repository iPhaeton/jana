//The tree contains every letter from the text only once
//Every letter contains indecies of its every parent (every previous letter in the text) and every child (every next letter in the text)
function Tree (text) {
    this.text = parentElem.textContent;
    this.docs = {};

    var current,
        previous,
        previousIndex;

    //get every letter from the text
    for (var i = 0; i < this.text.length; i++) {

        current = this.text.charAt(i);
        //if there is no such letter in the tree, create a new node for this letter and store its index
        if (this[current] === undefined) {
            this[current] = {
                indecies: new Set (),
                children: {},
                parents: {}
            };
            this[current].indecies.add (i);
        }
        //if there is such letter in the tree, only store its index in the existing node
        else {
            this[current].indecies.add (i);
        };

        //if there is a parent, store its index
        //inside the parent store the index of the current letter among children
        if (previous) {
            if (!this[current].parents[previous]) this[current].parents[previous] = new Set ();
            if (!this[previous].children[current]) this[previous].children[current] = new Set ();

            this[current].parents[previous].add (i); //parents contain indecies of their children
            this[previous].children[current].add (previousIndex); //children have indecies of their parents
        };
        previous = current;
        previousIndex = i;

    };
};

//Search by a letter colocation
Tree.prototype.find = function (str) {

    var j = 0;
    if (str.length === 1){
        if (this[str]) return returnResult(true, str);
        else return returnResult(false, null);
    };

    //set result with all indecies of the first letter
    var currentSymbol = str.charAt(0),
        nextSymbol = str.charAt(1),
        previousSymbol = currentSymbol;
    if (!this[currentSymbol] || !this[currentSymbol].children[nextSymbol]) {
        return returnResult(false, null);
    };

    //go from parent to child, if there is no next child, delete the corresponding property from result
    for (var i = 1; i < str.length - 1; i++) {
        currentSymbol = str.charAt(i);
        nextSymbol = str.charAt(i + 1);
        if (!this[currentSymbol] || !this[currentSymbol].children[nextSymbol]) {
            str = "";
            return returnResult(false, null);
        };

        previousSymbol = currentSymbol;
    };

    return returnResult(true, str);

    function returnResult(found, str) {
        if (found) {
            this.found = str;
            return true;
        }
        else {
            this.found = "";
            return false;
        }
    }
};

exports.Tree = Tree;