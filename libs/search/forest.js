"use strict";

var mongoose = require("libs/mongoose");
var logger = new require('libs/logger')(module);
var Tree = require("libs/search/tree").Tree;
var async = require("async");
var app = require("app");
var crypto = require("crypto");

class Forest {
    
    constructor (docs, fieldsToSearchIn) {
        this.trees = {};

        //var count = 0;
        
        for (let i = 0; i < docs.length; i++) {

            for (let j = 0; j < fieldsToSearchIn.length; j++) {
                let text = docs[i].specs[fieldsToSearchIn[j]];

                if (text) {
                    let sha = crypto.createHmac("sha256", text).digest("hex");
                    if (!this.trees[sha]) {
                        this.trees[sha] = new Tree (text, fieldsToSearchIn[j]);
                        //count++;
                    }
                    this.trees[sha].docs.add({id: [docs[i]._id], name: docs[i].specs["Название"]});
                };
            };
            
        };

        //console.log(count);
    };
    
    find (query) {
        var text = query["search-input"];
        var result = {},
            i = 0;
        
        for (var tree in this.trees) {
            if (this.trees[tree].search(text)) {
                for (var doc of this.trees[tree].docs) {
                    result[i++] = {_id: doc.id, specs: {"Название": doc.name}};
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