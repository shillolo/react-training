var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);
var schedule = require('node-schedule');

var Bun = require('./models/buns');
var Credit = require('./models/credit')
var User_Order = require('./models/user-order');
var Order = require('./models/order')
var indexRouter = require('./routes/index');
var userRoutes = require('./routes/user');

var app = express();
var http = require('http').Server(app);

var server = app.listen(3000);
var io = require('socket.io').listen(server);


// update stores (on new order) per websocket
io.on('connection', function(socket){
  User_Order.watch().
    on('change', function(){
      // datenbanken vergleichen per input auf html
      User_Order.find(function(err, order) {
        var fullArray = [];
        var counter = 0;
        if (err) {
        } else {
            for(var i = 0; i < order.length; i++){
                var thisday = new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0,0,0,0)
                var newday = new Date(order[i].date).setHours(0,0,0,0);
                var currentDay = new Date().setHours(0,0,0,0)
                if(thisday == newday || newday == currentDay){
                    counter++
                    var thisOrder = ({
                        position: counter,
                        order: order[i]
                    })
                    fullArray.push(thisOrder)
                } 
            }
        }
        Order.find(function(err, norder) {
            if (err) {
                console.log("error")
            } else {
                for(var i = 0; i < norder.length; i++){
                    var thisday = new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0,0,0,0)
                    var newday = new Date(norder[i].date).setHours(0,0,0,0);
                    var currentDay = new Date().setHours(0,0,0,0)
                    if(newday == thisday || newday == currentDay){
                        counter++
                    var thisOrder = ({
                        position: counter,
                        order: norder[i]
                    })
                    fullArray.push(thisOrder)
                    } 
                }
            }
            console.log("ttttt")
            console.log(fullArray)
            console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh")
            console.log(fullArray.length)
            // signal gets commited so that the javascript file can catch the signal via websocket
            io.emit('chatmessage', fullArray.length);
        });
      })
    })
});

require('./config/passport');


// reset blosed bakerys and soldout buns to open and available
schedule.scheduleJob('0 0 * * *', function(){
    Bun.find(function(err, buns) {
      for (var i = 0; i < buns.length; i++){
        buns[i].clicked = false
        if (i == buns.length){
          buns.save()
        }
      }
    })
    Bakery.find(function(err, status){
      status[0].closed = false;
      status.save()
    })
    console.log("didi it")
});

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}))
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'k7ig8fdjhrrtnfgtcftr0e',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection}),
    cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    if (req.user) {
    res.locals.useracc = req.user.email;
    res.locals.knumber = req.user.knumber;
    }
    next()
})

app.use('/user', userRoutes); 
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only provisding error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
