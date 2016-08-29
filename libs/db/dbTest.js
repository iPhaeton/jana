var mongoose = require("libs/mongoose");
var async = require("async");
var config = require("config");

module.exports = function (callback) {
    var logger = new require('libs/logger')(module);

    async.series([
        open,
        dropDatabase,
        requireModels,
        createTestDB
    ], callback)
};

function open (callback) {
    if (process.env.PORT) {
        mongoose.connect (config.get("mongoose:uri"), config.get("mongoose:options"));
    } else {
        mongoose.connect ("mongodb://localhost/jana-shop", config.get("mongoose:options"));
    };

    mongoose.connection.on("open", callback)
};

function dropDatabase (callback) {
    var db = mongoose.connection.db;
    db.dropDatabase (callback);
};

function requireModels (callback) {
    require("models/commodity");
    require("models/config");
    require("models/category");

    async.each(Object.keys(mongoose.models), (model, callback) => {
        mongoose.models[model].ensureIndexes(callback);
    }, callback);
};

function createTestDB(callback) {
    var commodityData = []

    for (var i = 0; i < 50; i++) {
        commodityData.push({
            number: i,
            img: "images/testPic.jpg",
            specs: {
                "Категория": "Лыжи",
                "Название": "Лыжи" + i,
                "Цена": i*100 + " р.",
                "В наличии": "10 пар",
                "Описание": "Просто самые лучшие лыжи на свете",
                "Длина": "1,5 м",
                "Цвет": "Жёлтенькие",
                "Производитель": "Производитель" + i
            }
        });
    };

    for (var i = 50; i < 100; i++) {
        commodityData.push({
            number: i,
            img: "images/testPic.jpg",
            specs: {
                "Категория": "Сноуборды",
                "Название": "Сноборд" + i,
                "Цена": i*100 + " р.",
                "В наличии": "10 пар",
                "Описание": "Просто самый лучший сноборд на свете",
                "Длина": "1,5 м",
                "Цвет": "Синенькие",
                "Производитель": "Производитель" + (i - 50)
            }
        });
    };

    for (var i = 100; i < 150; i++) {
        commodityData.push({
            number: i,
            img: "images/testPic.jpg",
            specs: {
                "Категория": "Спортивная одежда",
                "Название": "Куртка" + i,
                "Цена": i*100 + " р.",
                "В наличии": "10 пар",
                "Описание": "Просто самая лучшая куртка на свете",
                "Длина": "1,5 м",
                "Цвет": "Красненькая",
                "Производитель": "Производитель" + (i - 100)
            }
        });
    };

    for (var i = 150; i < 200; i++) {
        commodityData.push({
            number: i,
            img: "images/testPic.jpg",
            specs: {
                "Категория": "Спортивная обувь",
                "Название": "Тапки" + i,
                "Цена": i*100 + " р.",
                "В наличии": "10 пар",
                "Описание": "Просто самые лучшие тапки на свете",
                "Длина": "1,5 м",
                "Цвет": "Прозрачные",
                "Производитель": "Производитель" + (i - 150)
            }
        });
    };

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
    };

    var categoryData = [
        {
            name: "Лыжи",
            url: "/dbsearch?db=Commodity&specs=specs.Категория:Лыжи",
            position: 1
            //url: "/dbsearch?category=Лыжи&name=Самые%20лучшие%20лыжи&specs=specs.Цвет:Жёлтенькие;specs.Длина:1,5%20м",
        },
        {
            name: "Сноуборды",
            url: "/dbsearch?db=Commodity&specs=specs.Категория:Сноуборды",
            position: 2
        },
        {
            name: "Спортивная одежда",
            url: "/dbsearch?db=Commodity&specs=specs.Категория:Спортивная%20одежда",
            position: 3
        },
        {
            name: "Спортивная обувь",
            url: "/dbsearch?db=Commodity&specs=specs.Категория:Спортивная%20обувь",
            position: 4
        },
        {
            name: "Защитная экипировка",
            url: "/dbsearch?db=Commodity&specs=specs.Категория:Защитная%20экипировка",
            position: 5
        }
    ];
    
    var userData = [
        {
            username: "jana",
            password: "burachkovskaya",
            admin: true
        },
        {
            username: "Phaeton",
            password: "uhbgtuhbgt",
            admin: true
        },
        {
            username: "Ilya",
            password: "111"
        }
    ];

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
        },
        function (callback) {
            async.each(categoryData, (data, callback) => {
                var category = new mongoose.models.Category(data);
                category.save(callback);
            }, callback);
        },
        function (callback) {
            async.each(userData, (data, callback) => {
                var user = new mongoose.models.User(data);
                user.save(callback);
            }, callback);
        }
    ], callback);
};