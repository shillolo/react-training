var express = require("express");
var router = express.Router();
var csrf = require("csurf");
var async = require("async");
var crypto = require("crypto");
var Nexmo = require("nexmo");
var Promise = require("bluebird");
var hbs = require("nodemailer-express-handlebars");
var util = require("util");
var Bun = require("../models/buns");
var User_Order = require("../models/user-order");

// var csrfProtection = csrf();
// router.use(csrfProtection);

router.get("/", function(req, res, next) {
  var messages = req.flash("error");
  var successMsg = req.flash("success")[0];
  // get all the buns and put them in an array
  Bun.find(function(err, docs) {
    var productChunks = [];
    var chunkSize = 1;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render("shop/bakery", {
      messages: messages,
      hasErrors: messages.lenght > 0,
      products: productChunks,
      successMsg: successMsg,
      noMessages: !successMsg
    });
  })
    .then(exercise => res.json(exercise))
    .catch(err => res.status(400).json("Error: " + err));
  console.log(csrfToken);
});

router.post("/bakery", function(req, res, next) {
  console.log("f");
  function code_error() {
    res.redirect("bakery");
  }

  function charge_error() {
    req.flash("error", "Nicht Genügend Guthaben!");
    res.redirect("bakery");
  }

  function date_error() {
    req.flash("error", "Bitte geben sie ein gültiges Datum an.");
    res.redirect("bakery");
  }
  console.log("we");
  var thisTime = new Date().getHours();
  if (
    req.body.datepicker != undefined &&
    req.body.datepicker != null &&
    req.body.datepicker &&
    new Date(req.body.datepicker) != null &&
    req.body.datepicker.length > 0
  ) {
    console.log("herre");
    var datepicker = req.body.datepicker;

    function parseDate(input) {
      var parts = input.match(/(\d+)/g);
      if (parts === null || parts[0] > 31) {
        return false;
      } else {
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }
    var orderday = new Date();
    if (
      new Date(parseDate(datepicker)).setHours(0, 0, 0, 0) ==
      new Date().setHours(0, 0, 0, 0)
    ) {
      console.log("here");
      date_error();
    } else {
      if (
        (new Date(parseDate(datepicker)) !== false &&
          new Date(parseDate(datepicker)).setHours(0, 0, 0, 0) >=
            orderday.setHours(0, 0, 0, 0) &&
          new Date(parseDate(datepicker)).setHours(0, 0, 0, 0) <
            orderday.setMonth(orderday.getMonth() + 2)) ||
        datepicker == "Heute"
      ) {
        if (datepicker == "Heute") {
          var day = new Date();
          var nextDay = new Date(day);
          var date = nextDay;
          var m = nextDay.getMonth() + 1;
          var parsedDate = date.getDate() + "." + m + "." + date.getFullYear();
        } else {
          var date = new Date(parseDate(datepicker));
          var parsedDate = datepicker;
        }
        // create code that isnt in use yet (need to check for date)
        if (req.body.getnumber == 1) {
          var user_order = new User_Order({
            user: req.user,
            email: req.user.email,
            cart: productorder,
            amount: number,
            total: total,
            code: random,
            date: date,
            time: time,
            parsedDate: parsedDate,
            today: new Date()
          });
          user_order.save(function(err, result) {
            req.session.code = random;
            req.session.cart = productorder;
            req.session.amount = number;
            req.session.total = total;
            req.session.date = date;
            req.session.time = time;
            res.redirect("code");
          });
        } else {
          var total = 0;
          var productorder = [];
          var number = [];
          var counter = 0;
          var error = 0;
          var Errorloop = 0;
          var decimal = /^[-+]?[0-9]+\.[0-9]+$/;
          var bodylegth = req.body.getname.length;
          for (var i = 0; i < bodylegth; i++) {
            console.log(decimal);
            console.log(req.body[req.body.getname[i]]);
            if (
              req.body[req.body.getname[i]] < 1 ||
              req.body[req.body.getname[i]].match(decimal) ||
              !req.body[req.body.getname[i]] ||
              isNaN(req.body[req.body.getname[i]])
            ) {
              error++;
            }
          }
          if (error > 0) {
            code_error();
          } else {
            req.body.getname.forEach(function(broname) {
              Bun.findOne({ title: broname }, function(err, data) {
                var curdate = new Date().getTime();
                var expdate = new Date(data.expdate).getTime();
                console.log(curdate);
                console.log(expdate);
                if (
                  !data ||
                  (curdate >= expdate &&
                    new Date(date).setHours(0, 0, 0, 0) ==
                      new Date(data.expdate).setHours(0, 0, 0, 0))
                ) {
                  Errorloop++;
                  counter++;
                  console.log("hi");
                  console.log(req.body.getname.lenght);
                  if (Errorloop > 0 && counter == req.body.getname.lenght) {
                    code_error();
                  }
                } else {
                  console.log(broname);
                  console.log(req.body[broname]);
                  total -= -data.price * req.body[broname];
                  counter++;
                  productorder.push(broname);
                  number.push(req.body[broname]);
                  if (Errorloop > 0 && counter == req.body.getname.lenght) {
                    code_error();
                  } else if (counter == req.body.getname.length) {
                    var user_order = new User_Order({
                      cart: productorder,
                      amount: number,
                      total: parseFloat(Math.round(total * 100) / 100).toFixed(
                        2
                      ),
                      date: date,
                      parsedDate: parsedDate,
                      today: new Date()
                    });
                    user_order.save(function(err, result) {
                      req.session.cart = productorder;
                      req.session.amount = number;
                      req.session.total = parseFloat(
                        Math.round(total * 100) / 100
                      ).toFixed(2);
                      req.session.date = date;
                      if (err) {
                        res.send("bad email");
                        console.log(err);
                      } else {
                        res.redirect("code");
                      }
                    });
                  }
                }
              });
            });
          }
        }
      } else {
        console.log("num1");
        date_error();
      }
    }
  } else {
    console.log("num2");
    date_error();
  }
});

router.get("/code", function(req, res, next) {
  //    if (req.session.code){
  var order = req.session.cart;
  var total = req.session.total;
  var amount = req.session.amount;
  var date = new Date(req.session.date);
  var m = new Date(date).getMonth() + 1;
  var parsedDate = date.getDate() + "." + m + "." + date.getFullYear();
  if (Array.isArray(order)) {
    res
      .render("shop/code", {
        array: order,
        total: total,
        amount: amount,
        date: parsedDate
      })
      .then(exercise => res.json([order, total, amount, parsedDate]))
      .catch(err => res.status(400).json("Error: " + err));
  } else {
    res
      .render("shop/code", {
        string: order,
        total: total,
        amount: amount,
        date: parsedDate
      })
      .then(exercise => res.json([order, total, amount, parsedDate]))
      .catch(err => res.status(400).json("Error: " + err));
  }
});

module.exports = router;
