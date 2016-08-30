var mongoose = require("libs/mongoose");

module.exports = function (ids, callback) {
    var result = new Set();
    var counter = 0;
    
    for (var id of ids) {
        counter++;
        
        mongoose.models["Commodity"].findById(id, (err, commodity) => {
            if (err) {
                callback(err);
            } else {
                result.add(commodity._doc);
                counter--;
                if (!counter) callback(null, result);
            };
        });
    };
};