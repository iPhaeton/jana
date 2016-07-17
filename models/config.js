var mongoose = require("libs/mongoose");

var Schema = mongoose.Schema;

var configSchema = new Schema ({
    showcase: {
        type: Object
    }
});

module.exports = mongoose.model ("Config", configSchema);

