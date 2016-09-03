var async = require("async");
var crypto = require("crypto");
var mongoose = require("libs/mongoose");
var util = require("util");
var AuthError = require("errors").AuthError;

Schema = mongoose.Schema;

var schema = new Schema ({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    admin: {
        type: Boolean,
        default: false
    }
});

schema.methods.encryptPassword = function (password) {
    return crypto.createHmac("sha256", this.salt).update(password).digest("hex");
};

schema.virtual("password")
    .set(function (password) {
        this.salt = Math.random() + "";
        this.hashedPassword = this.encryptPassword(password);
    });

schema.methods.checkPassword = function (password) {
    return this.encryptPassword(password ) === this.hashedPassword;
};

schema.statics.authorize = function (username, password, callback) {
    var User = this;

    async.waterfall ([
        function (callback) {
            User.findOne({username: username}, callback);
        },
        function (user, callback) {
            if (user) {
                if (user.checkPassword(password)) {
                    callback(null, user);
                } else {
                    callback (new AuthError("Неверный пароль или имя пользователя"));
                };
            } else {
                callback (new AuthError("Неверный пароль или имя пользователя"));
            };
        }
    ], callback);
};

schema.statics.register = function (username, password, callback) {
    var user = new this({username: username, password: password});
    user.save(function (err) {
        if (err) return callback(err);
        callback(null, user);
    });
};

exports.User = mongoose.model ("User", schema);