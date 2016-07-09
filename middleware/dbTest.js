var mongoose = require("libs/mongoose");
var async = require("async");

module.exports = function () {
    var logger = new require('libs/logger')(module);

    async.series([
        open,
        dropDatabase,
        requireModels,
        createTestDB
    ], (err) => {
        if (err) {
            logger.logErr(err);
        } else {
            logger.log("db ok");
        };
        mongoose.disconnect();
    })
};

function open (callback) {
    mongoose.connection.on("open", callback)
};

function dropDatabase (callback) {
    var db = mongoose.connection.db;
    db.dropDatabase (callback);
};

function requireModels (callback) {
    require("models/commodity");

    async.each(Object.keys(mongoose.models), (model, callback) => {
        mongoose.models[model].ensureIndexes(callback);
    }, callback);
};

function createTestDB(callback) {
    var commodityData = [
        {
            number: "111",
            category: "Лыжи",
            name: "Самые лучшие лыжи",
            price: "5000",
            currency: "р.",
            amount: "10",
            unit: "пар",
            description: "Просто самые лучшие лыжы на свете",
            specs: {
                "Длина": "1,5 м",
                "Цвет": "Жёлтенькие"
            }
        },
        {
            number: "123",
            category: "Лыжи",
            name: "Не cамые лучшие лыжи",
            price: "1000",
            currency: "р.",
            amount: "15",
            unit: "пар",
            description: "Просто лыжы",
            specs: {
                "Длина": "1,5 м",
                "Цвет": "Отвратно серые"
            }
        },
        {
            number: "222",
            category: "Сноуборды",
            name: "Просто сноуборд",
            price: "1000",
            currency: "р.",
            amount: "15",
            unit: "шт.",
            description: "Обыкновенный сноуборд",
            specs: {
                "Длина": "1 м",
                "Цвет": "Белый"
            }
        },
        {
            number: "333",
            category: "Счастье",
            name: "Любовь",
            price: "Бесценно",
            description: "И наши с тобой слова, помыслы и дела бесконечны как два ангельские крыла"
        }
    ];

    async.each(commodityData, (data, callback) => {
        var commodity = new mongoose.models.Commodity(data);
        commodity.save(callback);
    }, callback);
};