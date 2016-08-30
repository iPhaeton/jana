"use strict";

var mongoose = require("libs/mongoose");
var logger = new require('libs/logger')(module);
var Tree = require("libs/search/tree").Tree;

class Forest {
    
    constructor (docs) {
        this.trees = {};
    
        for (let i = 0; i < docs.length; i++) {
            let fieldsToSearchIn = docs[i].searchable;
            for (let j = 0; j < fieldsToSearchIn.length; j++) {
                let text = docs[i].specs[fieldsToSearchIn[j]]

                if (!this.trees[text]) this.trees[text] = new Tree (text, fieldsToSearchIn[j]);
                this.trees[text].docsIds.add(docs[i]._id);
            };
        };
    };
    
};

module.exports = function () {
    mongoose.models.Commodity.find({}, (err, commodities) => {
        if (err) {
            logger.logErr(err);
            return;
        };

        let forest = new Forest(commodities);
        
        console.log(forest.trees["Жёлтенькие"].docsIds.size);
    });
};