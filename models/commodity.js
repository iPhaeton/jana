var mongoose = require("libs/mongoose");

var Schema = mongoose.Schema;

var commoditySchema = new Schema ({
  /*number: {
    type: String,
    unique: true
  },*/
  img: {
    type: String
  },
  specs: {
    type: Object
  }
});

commoditySchema.methods.writeData = function (data, next, callback) {
  for (var property in data) {
    this.set(property, data[property]);
  };
  
  this.save(function (err) {
    if (err) next(err);
    callback();
  });
};

module.exports = mongoose.model ("Commodity", commoditySchema);
