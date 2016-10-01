var mongoose = require("libs/mongoose");

var Schema = mongoose.Schema;

var configSchema = new Schema ({
    showcase: {
        type: Object
    },
    commoditySearchableFields: {
        type: Array
    }
});

module.exports = mongoose.model ("Config", configSchema);