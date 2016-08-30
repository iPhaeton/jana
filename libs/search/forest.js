"use strict";

var mongoose = require("libs/mongoose");
var logger = new require('libs/logger')(module);
var Tree = require("libs/search/tree").Tree;
var async = require("async");

class Forest {
    
    constructor (docs, fieldsToSearchIn) {
        this.trees = {};
        
        for (let i = 0; i < docs.length; i++) {

            for (let j = 0; j < fieldsToSearchIn.length; j++) {
                let text = docs[i].specs[fieldsToSearchIn[j]];
                console.log(text);

                var t = new Tree (text, fieldsToSearchIn[j]);
                console.log(t);
                if (!this.trees[text]) this.trees[text] = t;
                this.trees[text].docsIds.add(docs[i]._id);
            };
            
        };
    };
    
};

module.exports = function () {
    async.parallel([
        (callback) => {
            mongoose.models.Commodity.find({}, (err, commodities) => {
                if (err) {                        
                    callback(err);
                } else {
                    callback(null, commodities);
                }
            });
        },
        (callback) => {
            mongoose.models.Config.find({}, "commoditySearchableFields",(err, commoditySearchableFields) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null, commoditySearchableFields);
                }
            });
        }
    ], (err, data) => {
        if (err) {
            logger.logErr(err);
            return
        };
        
        //console.log(data[0].length, data[1].length);
        
        let forest = new Forest(data[0], data[1][0]);
        
        //console.log(forest.trees["Жёлтенькие"].docsIds.size);
    });
};