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
        //mongoose.disconnect();
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
    require("models/config")

    async.each(Object.keys(mongoose.models), (model, callback) => {
        mongoose.models[model].ensureIndexes(callback);
    }, callback);
};

function createTestDB(callback) {
    var commodityData = [
        {
            number: "111",
            img: "images/testPic.jpg",
            specs: {
                "Категория": "Лыжи",
                "Название": "Самые лучшие лыжи",
                "Цена": "5000 р.",
                "В наличии": "10 пар",
                "Описание": "Просто самые лучшие лыжи на свете",
                "Длина": "1,5 м",
                "Цвет": "Жёлтенькие"
            }
        },
        {
            number: "123",
            img: "images/testPic.jpg",
            specs: {
                "Категория": "Лыжи",
                "Название": "Не самые лучшие лыжи",
                "Цена": "1000 р.",
                "В наличии": "15 пар",
                "Описание": "Самые дешёвые",
                "Длина": "1,5 м",
                "Цвет": "Отвратно-серые"
            }
        },
        {
            number: "11",
            specs: {
                "Категория": "Лыжи",
                "Название": "Хорошие лыжи",
                "Цена": "5000 р.",
                "В наличии": "10 пар",
                "Описание": "Тоже очень-очень хорошие лыжи",
                "Длина": "1,5 м",
                "Цвет": "Стненьке"
            }
        },
        {
            number: "112",
            specs: {
                "Категория": "Лыжи",
                "Название": "Так себе лыжи",
                "Цена": "2000 р.",
                "В наличии": "0",
                "Описание": "Просто лыжи",
                "Длина": "1,5 м",
                "Цвет": "Неотвратно-серые"
            }
        },
        {
            number: "113",
            specs: {
                "Категория": "Лыжи",
                "Название": "Лыжи",
                "Цена": "4000 р.",
                "В наличии": "10 пар",
                "Описание": "Ещё одни хорошие лыжи",
                "Длина": "1,5 м",
                "Цвет": "Синеньке"
            }
        },
        {
            number: "333",
            specs: {
                category: "Счастье",
                name: "Любовь",
                price: "Бесценно",
                description: "И наши с тобой слова, помыслы и дела бесконечны как два ангельские крыла"
            }
        }
    ];

    var configData = {
        showcase: {
            "Название": {
                withTitle: false
            },
            "Цена": {
                withTitle: false,
                css: "return {\
                    color: '#c00'\
                }"
            },
            "В наличии": {
                withTitle: true,
                css: "return (+(data.specs['В наличии'].split(' ')[0]) ? {\
                    color: '#0f0'\
                } : {\
                    color: '#f00'\
                })"
            }
        }
    }

    async.parallel([
        function (callback) {
            async.each(commodityData, (data, callback) => {
                var commodity = new mongoose.models.Commodity(data);
                commodity.save(callback);
            }, callback);
        },
        function (callback) {
            var config = new mongoose.models.Config(configData);
            config.save(callback);
        }
    ], callback);
};