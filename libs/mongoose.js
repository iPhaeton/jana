var mongoose = require("mongoose");
var config = require("config");

if (process.env.PORT) {
    mongoose.connect (config.get("mongoose:uri"), config.get("mongoose:options"));
} else {
    mongoose.connect ("mongodb://localhost/jana-shop", config.get("mongoose:options"));
}

module.exports = mongoose;