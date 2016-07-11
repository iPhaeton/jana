var mongoose = require("libs/mongoose");

var Schema = mongoose.Schema;

var commoditySchema = new Schema ({
  number: {
    type: String,
    unique: true
  },
  img: {
    type: String
  },
  specs: {
    type: Object
  }
});

module.exports = mongoose.model ("Commodity", commoditySchema);
