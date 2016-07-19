var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorhandler = require("errorhandler");
var config = require("config");

var routes = require("./routes/indexRoute");
var shop = require("./routes/shopRoute");
var dbsearch = require("routes/dbSearchRoute");
var dbsave = require("routes/dbSaveRoute");
var filesave = require("routes/fileSaveRoute");

var app = express();
module.exports = app;

// view engine setup
app.engine("ejs", require("ejs-locals"));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//create logger
if (app.get('env') !== 'development') {
  require("./libs/createErrorsLogFile")(app);
};

var logger = new require('./libs/logger')(module);

//log out the requests
app.use(function (req, res, next) {
  logger.logReq(req);
  next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//test of the database
require("middleware/dbTest")();

/*var router = express.Router();
app.use(router.all("*", (req, res, next) => {
  var url = require("url");
  var reqParsed = url.parse(req.url, true);
  next();
}));*/

app.use("/", routes);
app.use("/shop", shop);
app.use("/dbsearch", dbsearch);
app.use("/dbsave", dbsave);
app.use("/savefile", filesave);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  logger.logErr(err, req);

  if (app.get('env') === 'development') {
    return next(err);
  }

  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(errorhandler());
};

//server
var server = app.listen(process.env.PORT || 3000, function () {
  logger.log("Server listening on port " + (process.env.PORT || 3000));
});

module.exports = app;
