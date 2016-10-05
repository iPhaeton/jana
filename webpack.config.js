var path = require("path")

const webpack = require("webpack");
const commonjs = require("babel-plugin-transform-es2015-modules-commonjs");

module.exports = {
    entry: "./public/javascripts/indexClient.js",

    output: {
        path: "./public/javascripts/build",
        filename: "index.js"
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                include: [path.resolve(__dirname, "public/javascripts")],
                loader: "babel-loader",
                query: {
                    presets: ["es2015"],
                }
            }
        ]
    }
};