var path = require("path")

const webpack = require("webpack");
const NODE_ENV = process.env.NODE_ENV || "development";

module.exports = {
    context: path.resolve(__dirname, "public/javascripts"),

    entry: {
        index: "./indexClient.js",
        shop: "./shopClient.js"
    },

    output: {
        path: "./public/javascripts/build",
        publicPath: "/javascripts/build/",
        filename: "[name].js",
        library: "[name]"
    },

    watch: NODE_ENV === "development",

    devtool: NODE_ENV === "development" ? "source-map" : null,

    resolve: {
        modulesDirectories: ["node_modules"],
        extentions: ["", ".js"],
        alias: {
            bootstrap: "../vendor/bower_components/bootstrap/dist/js/bootstrap",
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
                include: [path.resolve(__dirname, "public/javascripts")],
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
            }
        ]
    },

    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: "common"
        }),
        new webpack.ProvidePlugin({
            $: "../vendor/bower_components/jquery/dist/jquery"
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