"use strict";

var mongoose = require("libs/mongoose");
var logger = new require('libs/logger')(module);
var Tree = require("libs/search/tree").Tree;
var async = require("async");
var app = require("app");

class Forest {
    
    constructor (docs, fieldsToSearchIn) {
        this.trees = {};
        
        for (let i = 0; i < docs.length; i++) {

            for (let j = 0; j < fieldsToSearchIn.length; j++) {
                let text = docs[i].specs[fieldsToSearchIn[j]];

                if (text) {
                    if (!this.trees[text]) this.trees[text] = new Tree (text, fieldsToSearchIn[j]);
                    this.trees[text].docsIds.add(docs[i]._id);
                };
            };
            
        };
    };
    
    find (query) {
        var text = query["search-input"];
        var result = new Set();
        
        for (var tree in this.trees) {
            if (this.trees[tree].search(text)) {
                for (var id of this.trees[tree].docsIds) {
                    result.add(id);
                };
            };
        };
        
        return result;
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
        
        let forest = new Forest(data[0], data[1][0]._doc.commoditySearchableFields);
        app.set("forest", forest);
        
        //console.log(forest.trees["Жёлтенькие"].docsIds.size);
    });
};