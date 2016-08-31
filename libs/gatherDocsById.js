var mongoose = require("libs/mongoose");

module.exports = function (ids, callback) {
    var result = new Array(ids.size);
    var counter = 0;
    
    for (var id of ids) {
        counter++;
        
        mongoose.models["Commodity"].findById(id, (err, commodity) => {
            if (err) {
                callback(err);
            } else {
                counter--;
                result[counter] = commodity._doc;
                if (!counter) callback(null, result);
            };
        });
    };
};