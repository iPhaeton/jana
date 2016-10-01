var session = require('express-session');
var MongoStore = require("connect-mongo")(session);
var mongoose = require("libs/mongoose");

var sessionStore = new MongoStore({mongooseConnection: mongoose.connection});

module.exports = sessionStore;