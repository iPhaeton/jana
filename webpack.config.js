"use strict";

var path = require("path");

const webpack = require("webpack");
const NODE_ENV = process.env.NODE_ENV || "development";

const ExtractTextPlugin = require("extract-text-webpack-plugin");
const AssetsPlugin = require("assets-webpack-plugin");

module.exports = {
    context: path.resolve(__dirname, "public"),

    entry: {
        index: "./javascripts/indexClient.js",
        shop: "./javascripts/shopClient.js"
    },

    output: {
        path: "./public/build",
        publicPath: "/build/",
        filename: "[name].[chunkhash].js",
        chunkFilename: "[name].[chunkhash].js",
        library: "[name]"
    },

    watch: NODE_ENV === "development",

    devtool: NODE_ENV === "development" ? "source-map" : null,

    resolve: {
        modulesDirectories: ["node_modules"],
        extentions: ["", ".js"],
        alias: {
            bootstrap: "../../vendor/bower_components/bootstrap/dist/js/bootstrap",
            async: "../vendor/bower_components/async/dist/async",
            sockjs: "../vendor/bower_components/sockjs/sockjs"
        }
    },

    resolveLoader: {
        modulesDirectories: ["node_modules"],
        moduleTemplates: ["*-loader", "*"],
        extentions: ["", ".js"]
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                include: [path.resolve(__dirname, "public/javascripts"), path.resolve(__dirname, "public/components")],
                loader: "babel",
                query: {
                    presets: ["es2015", "stage-0"],
                    //plugins: ["transform-runtime"]
                }
            },
            {
                test: /bootstrap\.js$/,
                include: [path.resolve(__dirname, "public")],
                loader: "imports?jQuery=../../../jquery/dist/jquery"
            },
            {
                test:/\.css$/,
                exclude: /(headMenuStyle|bootstrap|style|searchPanel)\.css$/,
                loader: "style!css!autoprefixer?browsers=last 2 versions"
            },
            {
                test: /(headMenuStyle|bootstrap|style|searchPanel)\.css$/,
                loader: ExtractTextPlugin.extract("css!autoprefixer?browsers=last 2 versions")
            },
            {
                test:/\.ejs$/,
                loader: "ejs"
            },
            //for bootstrap
            {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff&name=[name].[hash:6].[ext]'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream&name=[name].[hash:6].[ext]'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=[name].[hash:6].[ext]'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xm&name=[name].[hash:6].[ext]'}
        ]
    },

    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: "common"
        }),
        new webpack.ProvidePlugin({
            $: path.resolve(__dirname, "public/vendor/bower_components/jquery/dist/jquery"),
            _: "underscore"
        }),
        new ExtractTextPlugin('[name].[contenthash].css', {
            allChunks: true
        }),
        new AssetsPlugin({
            filename: "build.json",
            path: path.resolve(__dirname, "public/build")
        })
    ],
};

if (NODE_ENV === "production") {
    module.exports.plugins.push (
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true,
                unsafe: true
            }
        })
    )
};