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
        filename: addHash("[name].js", "chunkhash"),
        chunkFilename: addHash("[name].js", "chunkhash"),
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
            {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                loader: addHash('url?limit=10000&mimetype=application/font-woff&name=[name].[ext]', "hash:6")
            },
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: addHash('url?limit=10000&mimetype=application/octet-stream&name=[name].[ext]', "hash:6")
            },
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: addHash('file?name=[name].[ext]', "hash:6")
            },
            {test: /\.jpg$/,
                loader: addHash('file?name=[name].[ext]', "hash:6")
            },
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: addHash('url?limit=10000&mimetype=image/svg+xm&name=[name].[ext]', "hash:6")
            }
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
        new ExtractTextPlugin(addHash('[name].css', "contenthash"), {
            allChunks: true
        }),
        new AssetsPlugin({
            filename: "build.json",
            path: path.resolve(__dirname, "public/build")
        }),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV)
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

function addHash (template, hash) {
    return NODE_ENV === "production" ? template.replace(/\.[^.]+$/, `.[${hash}]$&`) : template;
};