var mongoose = require("libs/mongoose");

var Schema = mongoose.Schema;

var commoditySchema = new Schema ({
  number: {
    type: String,
    unique: true
  },
  category: {
    type: String
  },
  name: {
    type: String
  },
  manufacturer: {
    type: String
  },
  price: {
    type: String
  },
  currency: {
    type: String
  },
  amount: {
    type: String
  },
  unit: {
    type: String
  },
  description: {
    type: String
  },
  specs: {
    type: Object
  }
});

module.exports = mongoose.model ("Commodity", commoditySchema);
