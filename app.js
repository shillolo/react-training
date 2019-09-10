var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressHbs = require("express-handlebars");
var bodyParser = require("body-parser");
var session = require("express-session");
var flash = require("connect-flash");
var validator = require("express-validator");

var indexRouter = require("./routes/index");
var User_Order = require("./models/user-order");

var app = express();
var http = require("http").Server(app);

var server = app.listen(3000);

// view engine setup
app.engine(".hbs", expressHbs({ defaultLayout: "layout", extname: ".hbs" }));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "k7ig8fdjhrrtnfgtcftr0e",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 180 * 60 * 1000 }
  })
);
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only provisding error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = app;
