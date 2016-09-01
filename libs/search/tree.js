"use strict";

//The tree contains every letter from the text only once
//Every letter contains indecies of its every parent (every previous letter in the text) and every child (every next letter in the text)
class Tree {
    
    constructor (text, name) {
        this.text = text;
        this.docsIds = new Set();//ids of the docs that contain this text
        this.name = name;//the name of a field that contains this text in a doc
        this.found = null;//a collocation that was found in this tree

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
    
    search (str) {
        let returnResult = (result) => {
            if (result) {
                this.found = str;
                return result;
            } else {
                this.found = null;
                return null;
            }
        };

        //a single letter string
        if (str.length === 1 && this[str]) return returnResult(this[str].indecies);

        //result is a set of the indecies where a found collocation starts
        var result = new Set();

        var currentSymbol = str.charAt(0),
            nextSymbol = str.charAt(1),
            previousSymbol = currentSymbol;
        if (!this[currentSymbol] || !this[currentSymbol].children[nextSymbol]) return returnResult(null);
        for (var index of this[currentSymbol].children[nextSymbol]) {
            result.add(index);
        };

        for (var i = 1; i < str.length - 1; i++) {
            currentSymbol = str.charAt(i);
            nextSymbol = str.charAt(i + 1);
            if (!this[currentSymbol] || !this[currentSymbol].children[nextSymbol]) return returnResult(null);

            for (var index of this[currentSymbol].parents[previousSymbol]) {
                if (!this[currentSymbol].children[nextSymbol].has(index)) result.delete(index - i);
            };

            previousSymbol = currentSymbol;
        };

        return returnResult(result);
    };

}

exports.Tree = Tree;