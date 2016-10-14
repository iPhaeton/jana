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
        this.fieldsToSearchIn = fieldsToSearchIn;

        //var count = 0;
        
        for (let i = 0; i < docs.length; i++) {
            this.plant(docs[i]);
        };

        //console.log(count);
    };

    plant (doc) {
        let fieldsToSearchIn = this.fieldsToSearchIn;

        for (let j = 0; j < fieldsToSearchIn.length; j++) {
            let text = doc.specs[fieldsToSearchIn[j]];

            if (text) {
                let sha = crypto.createHmac("sha256", text).digest("hex");
                if (!this.trees[sha]) {
                    this.trees[sha] = new Tree (text, fieldsToSearchIn[j]);
                    //count++;
                }
                this.trees[sha].docs.add(doc.id);
            };
        };
    };
    
    find (query, socket, key) {
        this.key = key;

        var text = query["search-input"];
        this.result = new Set();
        
        for (var tree in this.trees) {
            if (this.trees[tree].search(text)) {
                for (var id of this.trees[tree].docs) {
                    this.result.add(id);
                };
            };
        };

        socket.write(JSON.stringify({type: "searchResult", data: "searchComplete"}));
    };
    
    yeildFinalResults (socket) {
        if (!this.result.size) {
            socket.write(JSON.stringify({type: "searchResult", data: null}));
            return;
        };

        var self = this;
        
        var count = this.result.size;
        
        (function (key) {
            for (var id of self.result) {
                mongoose.models["Commodity"].findById(id, (err, commodity) => {
                    if (key !== self.key) return;
                    
                    if (err) {
                        logger.logErr(err);
                        socket.write(JSON.stringify({type: "searchResult", data: "Error"}));
                    } else {
                        count--;
                        if (!count) {
                            socket.write(JSON.stringify({type: "searchResult", data: commodity, done: true, key: key}));
                        } else {
                            socket.write(JSON.stringify({type: "searchResult", data: commodity, done: false, key: key}));
                        };
                    };
                });
            };
        })(this.key);
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