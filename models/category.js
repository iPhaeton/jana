var mongoose = require("libs/mongoose");

var Schema = mongoose.Schema;

var categorySchema = new Schema ({
    name: {
        type: String,
        unique: true
    },
    url: {
        type: String
    },
    position: {
        type: Number
    }
});

module.exports = mongoose.model ("Category", categorySchema);
