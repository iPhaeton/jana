var mongoose = require("libs/mongoose");

var Schema = mongoose.Schema;

var commoditySchema = new Schema ({
  category: {
    type: String
  },
  name: {
    type: String
  },
  price: {
    type: String
  },
  amount: {
    type: String
  },
  description: {
    type: String
  },
  specs: {
    type: Object
  }
});

module.exports = mongoose.model ("commodity", commoditySchema);
