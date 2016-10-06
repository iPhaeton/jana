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
        filename: "[name].js",
        library: "[name]"
    },

    watch: NODE_ENV === "development",

    devtool: NODE_ENV === "development" ? "source-map" : null,

    resolve: {
        modulesDirectories: ["node_modules"],
        extentions: ["", ".js"]
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
            }
        ]
    },

    plugins: []
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
}