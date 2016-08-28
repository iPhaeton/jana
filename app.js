var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorhandler = require("errorhandler");
var config = require("config");
var session = require('express-session');

var HttpError = require("errors").HttpError;
var sendHttpError = require("middleware/sendHttpError");

var routes = require("./routes/indexRoute");
var shop = require("./routes/shopRoute");
var dbsearch = require("routes/dbSearchRoute");
var dbsave = require("routes/dbSaveRoute");
var dbdel = require("routes/dbDelRoute");
var filesave = require("routes/fileSaveRoute");
var filedel = require("routes/fileDelRoute");
var list = require("routes/listRoute");
var signup = require("routes/signupRoute");
var signin = require("routes/signinRoute");
var signout = require("routes/signoutRoute");
var search = require("routes/searchRoute");

var app = express();
module.exports = app;

//global variable, which indicates conditions of the datatbase
app.set("dbConnected", false);

// view engine setup
app.engine("ejs", require("ejs-locals"));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//create logger
var logger;
if (app.get('env') !== 'development') {
  require("./libs/createErrorsLogFile")(app, (e) => {
    logger = new require('./libs/logger')(module);
    if (e) logger.logErr("Errors logfile has not been created");
  });
} else {
  logger = new require('./libs/logger')(module);
};

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
//require("libs/db/dbTest")();
require("libs/db/dbConnect")();

/*var router = express.Router();
app.use(router.all("*", (req, res, next) => {
  var url = require("url");
  var reqParsed = url.parse(req.url, true);
  next();
}));*/

//add an HttpError handler
app.use(sendHttpError);

//database check
app.use(require("middleware/dbCheck"));

//sessions
var sessionStore = require("libs/sessionStore");
app.use(session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: sessionStore
}));

//user
app.use(require("middleware/loadUser"));

//routes
app.use("/", routes);
app.use("/shop", shop);
app.use("/dbsearch", dbsearch);
app.use("/dbsave", dbsave);
app.use("/dbdel", dbdel);
app.use("/savefile", filesave);
app.use("/delfile", filedel);
app.use("/list", list);
app.use("/signup", signup);
app.use("/signin", signin);
app.use("/signout", signout);
app.use("/search", search);

// error handlers
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  logger.logErr(err, req);

  //HttpError handler
  if (err instanceof HttpError) {
    res.sendHttpError(err);
    return;
  };

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    errorhandler()(err, req, res, next);
    return;
  };

  // production error handler
  // no stacktraces leaked to user
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    statusCode: err.status || 500
  });
});

//server
var server = app.listen(process.env.PORT || config.get("port"), process.env.IP || "0.0.0.0", function () {
  logger.log("Server listening on port " + (process.env.PORT || config.get("port")));
});