var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var paypal = require('paypal-rest-sdk');
var Nexmo = require("nexmo");
var ws = require("nodejs-websocket");
var EmailTemplate = require("email-templates");
var Promise = require("bluebird");
var nodemailer = require("nodemailer");
var hbs = require('nodemailer-express-handlebars');
var socket = require('socket.io')
var smtpTransport = require('nodemailer-smtp-transport');
var Product = require('../models/product');
var Order = require('../models/order');
var Credit = require('../models/credit');
var Transfer = require('../models/transfer');
var TransactionID = require('../models/transactionId');
var Coordinates = require('../models/coordinates');
var Bun = require('../models/buns');
var Bakery = require('../models/bakerys');
var User_Order = require('../models/user-order');
var User = require('../models/breaduser');
var Newsletter = require('../models/newsletter');
var util = require('util');

var Sofort = new (require('node-sofort'))({
    configKey : '181556:493374:5c3627c5d50e1f77ee0f5824abb46084'
});

var mailer = nodemailer.createTransport({
    host: 'smtp.fastmail.com',
    port: 465,
    auth: {
        user: 'service@brotritter.de',
        pass: 'b4zs6mcmgjxhu9le'
    },
    tls:{
        rejectUnauthorized:false
    }
});

var io = socket(server);

router.get("/mybakery", isAuth, function(req, res, next){
  // Insert a doc, will trigger the change stream handler above
//   console.log(new Date(), 'Inserting doc');
//   await Person.create({ name: 'Axl Rose' });
    if (req.session.timepicker){
        var pickedTime = req.session.timepicker
    }else{
        var pickedTime = "12:00"
    }
    
    Bun.find(function(err, docs) {
        var productChunks = [];
        var chunkSize = 1;
        for (var i = 0; i < docs.length; i+= chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
    }  
    function parseDate(input) {
          var parts = input.match(/(\d+)/g);
          if(parts === null || parts[0] > 31) {
             return false
             } else {
          return new Date(parts[2], parts[1]-1, parts[0])
             }
    };
    function today(e)
    {
        var today = new Date(e);
        var dd = today.getDate();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();

        today = dd+'/'+mm+'/'+yyyy;

        return today;   
    }
    function tomorrow(e)
    {
        var today = new Date(e);
        var dd = today.getDate()+1;
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();

        today = dd+'/'+mm+'/'+yyyy;

        return today;   
    }
    var fullArray = [];
    var numberArray = [];
    var counter = 0;
    User_Order.find(function(err, order) {
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
                    fullArray.push(thisOrder);
                    console.log(thisOrder.order.today)
                    numberArray.push(new Date(thisOrder.order.today).getTime())
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
                    numberArray.push(new Date(thisOrder.order.today).getTime())
                    } 
                }
            }
            // sort array so that the newest orders come out on top
            var endArray = [];
            var closed;
            function sortNumber(a, b) {
                return a - b;
              }
            numberArray.sort(sortNumber);
            var i = 0
            while (i < numberArray.length){
                for (var d = 0; d < fullArray.length; d++){
                    if (numberArray[i] == new Date(fullArray[d].order.today).getTime()){
                        endArray.push(fullArray[d])
                        i++
                    }
                }
            }
            // check if bakery is closed or not
            Bakery.find(function(err, status){
                if (status[0].closed == true){
                     closed = true
                } else {
                     closed = false 
                }
            res.render('shop/bakeryPage', { order: endArray, products: productChunks, timepicker: pickedTime, closed: closed})
         })
        });
    })
})})

router.post("/deactivate", function(req, res, next){
    Bakery.find(function(err, status) {
        status[0].closed = true;
        status[0].save(function(){
            res.redirect("back")
        })
    })
})

router.post("/mybakery", function(req, res, next){
    mailer.use('compile',hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: 'views/email',
            layoutsDir: 'views/email',
            defaultLayout: 'bakesuggest.hbs',
          },
        viewPath: 'views/email',
        extName: '.hbs'
    }))
    console.log(req.body.confirmer)
    if (req.body.confirmer == "failure"){
    var orderId = req.body.userid;
    User_Order.findOne({_id: orderId}).exec(function(err, order)   {
        if (!order){
            Order.findOne({_id:orderId}).exec(function(err, thisorder){
                thisorder.remove();
                thisorder.save(function(err, success){
                    mailer.sendMail({
                        from: 'service@brotritter.de',
                        to: req.body.requser,
                        subject: "Bestellung",
                        template: 'membermail'
                    },function (err, response){
                        if(err){
                            console.log(err)
                            req.flash("success", "Ihre Anfrage wird verarbeitet und wir werden uns in Kürze bei Ihnen melden.");
                            res.redirect("back")
                        } else {
                            req.flash("success", "Ihre Anfrage wird verarbeitet und wir werden uns in Kürze bei Ihnen melden.");
                            res.redirect("back");
                        }
                    })
                })
            })
        } else {
        var ourUser = req.body.user;
        order.remove();
        order.save(function(err, done){
            console.log(ourUser)
            Credit.findOne({user: ourUser}).sort({"_id": -1}).exec(function(err, data)   {
                console.log(data)
                data.credit = data.credit - (-order.total);
                data.save(function(wrong, go){
                    mailer.sendMail({
                        from: 'service@brotritter.de',
                        to: req.body.userMail,
                        subject: "Bestellung",
                        template: 'membermail'
                    },function (err, response){
                        if(err){
                            console.log(err)
                            req.flash("success", "Ihre Anfrage wird verarbeitet und wir werden uns in Kürze bei Ihnen melden.");
                            res.redirect("/")
                        } else {
                            req.flash("success", "Ihre Anfrage wird verarbeitet und wir werden uns in Kürze bei Ihnen melden.");
                            res.redirect("/");
                        }
                    })
                    req.session.code = false;
                    req.session.cart = false;
                    req.session.amount = false;
                    req.session.total = false;
                    req.session.date = false;
                    req.session.time = false;
                    res.redirect("back")
                })
            })
        })
    }
    })
} else if (req.body.confirmer == "confirm"){
    mailer.use('compile',hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: 'views/email',
            layoutsDir: 'views/email',
            defaultLayout: 'bakesuggest.hbs',
          },
        viewPath: 'views/email',
        extName: '.hbs'
    }))
    console.log("ee")
    var orderId = req.body.userid;
    User_Order.findOne({_id: orderId}).exec(function(err, order)   {
        if (!order){
            console.log("ee")
            Order.findOne({_id:orderId}).exec(function(err, thisorder){
                thisorder.packed = true;
                thisorder.save(function(err, success){
                    mailer.sendMail({
                        from: 'service@brotritter.de',
                        to: req.body.requser,
                        subject: "Bestellung",
                        template: 'bakesuggest',
                        context: {
                            code: req.body.code
                        },
                        attachments: [{
                            filename: "BrotritterBakery1.jpg",
                            path: "./public/images/BrotritterBakery1.jpg",
                            cid: "cross"
                        },
                        {
                            filename: "MyLogo.png",
                            path: "./public/images/MyLogo.png",
                            cid: "logo"
                        }]
                    },function (err, response){
                        if(err){
                            console.log(err)
                            res.redirect("back");
                            req.flash("error", "Ihre Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.");
                        } else {
                            res.redirect("back");
                            req.flash("success", "Bestellung wurde verpackt!");
                        }
                    })
                })
            })
        } else {
        var ourUser = req.body.user;
        order.packed = true;
        order.save(function(err, done){
                    mailer.sendMail({
                        from: 'service@brotritter.de',
                        to: req.body.userMail,
                        subject: "Bestellung",
                        template: 'bakesuggest',
                        context: {
                            code: req.body.code
                        },
                        attachments: [{
                            filename: "BrotritterBakery1.jpg",
                            path: "./public/images/BrotritterBakery1.JPG",
                            cid: "cross"
                        },
                        {
                            filename: "MyLogo.png",
                            path: "./public/images/MyLogo.png",
                            cid: "logo"
                        }]
                    },function (err, response){
                        if(err){
                            console.log(err)
                            res.redirect("back");
                            req.flash("error", "Ihre Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.");
                        } else {
                            res.redirect("back");
                            req.flash("success", "Bestellung wurde verpackt!");
                        }
                    })
                })
            }
            })
}
})

router.post('/killallbuns', function(req, res, next) {
    time = req.body.timepicker;
    req.session.timepicker = req.body.timepicker;
    console.log(time)
    time = time.split(":")
    console.log(time[0])
    var today = new Date();
    var counter = 0
    today.setHours(time[0], 0 ,0,0);
    Bun.find(function(err, docs) {
        for (var i = 0; i < docs.length; i++){
            docs[i].expdate = today;
            docs[i].save();
            counter++
            if (counter == docs.length){
                res.redirect("back")
            }
        }
    })
})

// make ONE bun un-/available
router.post('/killbun', function(req, res, next) {
    var bunname = req.body.breadname;
    var state = req.body.status
    var today = new Date();
    if (state == "redo"){
    Bun.findOne({title: bunname}).exec(function(err, data) {
        data.expdate = false;
        data.clicked = false;
        data.save(function(){
            res.redirect("back");
        })
    })
    }else{
        Bun.findOne({title: bunname}).exec(function(err, data) {
            data.expdate = today;
            data.clicked = true;
            data.save(function(){
                res.redirect("back");
            })
        })
    }
})

var csrfProtection = csrf();
router.use(csrfProtection);

var server = ws.createServer(function (conn){
    console.log("New")
})

paypal.configure({
  'mode': 'live', //sandbox or live
  'client_id': 'ASmiTT40MbQg7v10HPCzQw88fazuAu355k69if6JZ31s-ca4aAMrR_FDwjfx-9mQY3JHnrR9JR4EI7zq',
  'client_secret': 'ENoz6bYlWfzFUqidReWmr4vk7kNzhBbVXCpQK86lcDDqYlFSQOLfhLIuMWc48QRob2kd-ZsEAboD5M_s'
});

router.get('/newsletter', function(req, res, next) {
    res.render('shop/newsletter', {csrfToken: req.csrfToken()})
})

router.post('/newsletter', function(req, res, next) {
    var newsletter = new Newsletter({
        email: req.body.email,
        address: req.body.postleitzahl
    })
    newsletter.save(function(err, result) {
        if(err){
            console.log(err)
            req.flash("error", "Ihre Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.");
            res.redirect("/")
        } else {
            req.flash("success", "Sie haben sich erfolgreich für den Brotritter Newsletter angemeldet");
            res.redirect("/");
        }
    })
})

router.get('/mitgliedschaft', function(req, res, next) {
    res.render('shop/membership', {csrfToken: req.csrfToken()})
})

router.get('/testo', function(req, res, next) {
    mailer.sendMail({
        from: 'service@brotritter.de',
        to: 'darren.igb@web.de',
        subject: "Anfrage:",
        template: 'membermail'
    },function (err, response){
        if(err){
            console.log(err)
            req.flash("error", "Ihre Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.");
            res.redirect("/")
        } else {
            req.flash("success", "Ihre Anfrage wird verarbeitet und wir werden uns in Kürze bei Ihnen melden.");
            res.redirect("/");
        }
    })
})

router.post('/testo', function(req, res, next) {
    mailer.sendMail({
        from: 'service@brotritter.de',
        to: 'darren.igb@web.de',
        subject: "Anfrage:" + req.body.name,
        template: 'membermail'
    },function (err, response){
        if(err){
            req.flash("error", "Ihre Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.");
            res.redirect("/")
        } else {
            req.flash("success", "Ihre Anfrage wird verarbeitet und wir werden uns in Kürze bei Ihnen melden.");
            res.redirect("/");
        }
    })
})

router.get('/sofort/success1/:transaction', function(req, res) {
    var referer = req.headers.referer;
    var transactionId  = req.params.transaction;
    TransactionID.findOne({id: req.params.transaction}).exec(function(err, data) {
        console.log(referer)
        console.log(transactionId)
        console.log(data)
        if(!data && referer == "https://www.sofort.com/"){
            var transid = new TransactionID({
                id: transactionId
            })
            transid.save(function(err, result) {
                console.log(req.session.user_email)
                var order = new Order({
                    requser: req.session.user_email,
                    cart: req.session.var2,
                    amount: req.session.var3,
                    total: req.session.var4,
                    code: req.session.var1,
                    date: req.session.var5,
                    time: req.session.var7,
                    parsedDate: req.session.var6,
                    today: new Date()
                })
                order.save(function(err, result) {
                    req.session.code = req.session.var1;
                    req.session.cart = req.session.var2;
                    req.session.amount = req.session.var3;
                    req.session.total = parseFloat(Math.round(req.session.var4 * 100) / 100).toFixed(2);
                    req.session.date = req.session.var5;
                    req.session.parsedDate = req.session.var6;
                    req.session.time = req.session.var7;
                    req.session.var1 = false;
                    req.session.var2 = false;
                    req.session.var3 = false;
                    req.session.var4 = false;
                    req.session.var5 = false;
                    req.session.var6 = false;
                    req.session.var7 = false;
                    req.flash("success", 'Die Bestellung wurde erfolgreich abgeschlossen.');
                    console.log(req.session.user_email);
                    console.log(req.session.code);
                    console.log(req.session.parsedDate);
                    console.log(req.session.time);
                    mailer.use('compile',hbs({
                        viewEngine: {
                            extName: '.hbs',
                            partialsDir: 'views/email',
                            layoutsDir: 'views/email',
                            defaultLayout: 'success.hbs',
                          },
                        viewPath: 'views/email',
                        extName: '.hbs'
                    }))
                    mailer.sendMail({
                        from: 'service@brotritter.de',
                        to: req.session.user_email,
                        subject: "Bestellung Brotritter",
                        template: 'success',
                        context: {
                            code: req.session.code,
                            date: req.session.parsedDate,
                            time: req.session.time
                        } 
                    },function (err, response){
                        if(err){
                            res.send("bad email");
                            console.log(err)
                        } else {
                            res.redirect("/code")
                        }
                    })
                });                                            
            })
        } else {
            console.log("xwa")
            res.redirect("/")
        }
    })
});

router.get('/sofort/success2/:transaction', function(req, res) {
    var referer = req.headers.referer;
    var transactionId  = req.params.transaction;
    TransactionID.findOne({id: req.params.transaction}).exec(function(err, data) {
        if(!data && referer == "https://www.sofort.com/"){
            console.log("ye");
            var transid = new TransactionID({
                id: transactionId
            })
            transid.save(function(err, result) {
                res.redirect('/')
                console.log("notyet")
            })
        } else {
            res.redirect("/")
            console.log("swed")
        }
    })
});

router.get('/sofort', function(req, res, next) {
'use strict';
var util = require('util');
var Sofort = new (require('node-sofort'))({
		configKey : '181556:493374:5c3627c5d50e1f77ee0f5824abb46084'
	});

try {
	Sofort.createPayment(101.00, 'EUR', ['Demo1'], {
        user_variables: ['variable1','variable2','variable3'],
        success_url: 'http://localhost:3000/sofort/success/-TRANSACTION-',
        success_link_redirect: true}, function (err, data) {
		console.log(data);
		console.log(data.payment_url);
        res.redirect(data.payment_url)
	});
} catch (e) {
	console.log(e);
}
})

router.get('/soforto', function(req, res, next) {
console.log(req.headers.cookie)
})

router.post('/mitgliedschaft', function(req, res, next) {
    mailer.sendMail({
        from: 'service@brotritter.de',
        to: 'darren.igb@web.de',
        subject: "Anfrage:" + req.body.name,
        template: 'membermail',
        context: {
            name: req.body.name,
            address: req.body.address,
            postleitzahl: req.body.postleitzahl,
            number: req.body.number,
            email: req.body.email,
            contact: req.body.contact,
        }
    },function (err, response){
        if(err){
            req.flash("error", "Ihre Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.");
            res.redirect("/")
        } else {
            req.flash("success", "Ihre Anfrage wird verarbeitet und wir werden uns in Kürze bei Ihnen melden.");
            res.redirect("/");
        }
    })
})

router.post('/maps', function(req, res, next) {
    mailer.use('compile',hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: 'views/email',
            layoutsDir: 'views/email',
            defaultLayout: 'membermail.hbs',
          },
        viewPath: 'views/email',
        extName: '.hbs'
    }))
    mailer.sendMail({
        from: 'service@brotritter.de',
        to: 'service@brotritter.de',
        subject: "Bäckereivorschlag:" + req.body.bakename,
        template: 'membermail',
        context: {
            bakename: req.body.bakename,
            address: req.body.address,
        }
    },function (err, response){
        if(err){
            req.flash("error", "Ihre Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.");
            console.log(err)
        } else {
            req.flash("success", "Ihr Vorschlag wurde in Kenntnis genommen. Vielen Dank für Ihre Unterstützung.");
            res.redirect("back");
        }
    })
})

router.get('/auth', function(req, res, next) {
    res.render('shop/auth', {csrfToken: req.csrfToken()})
})

router.post('/auth', function(req, res, next) {
    if (req.body.input == "asdfgh"){
        req.session.auth = true;
        res.redirect("/")
    } else {
        res.redirect("auth")
    }
})

router.get('/', isAuth, function(req, res, next) {
    var messages = req.flash('error');
    var success = req.flash("success");
    Credit.findOne({user: req.user}).sort({"_id": -1}).exec(function(err, data)   {
    if (!data){
        var credit = parseFloat(Math.round((0) * 100) / 100).toFixed(2)
    } else {
        var credit = parseFloat(Math.round((data.credit) * 100) / 100).toFixed(2)
    }
    res.render('shop/index', {csrfToken: req.csrfToken(), messages: messages, credit: credit, success: success})
    });
})

router.post('/', function(req, res, next) {
    req.session.address = req.body.address;
    res.redirect("maps")
})

router.post('/mapsSearch', function(req, res, next) {
    req.session.address = req.body.address;
    res.redirect("maps")
})

router.get('/maps', isAuth, function(req, res, next) {
    //Call Geocode
    var messages = req.flash('error');
    var location = req.session.address;
    if (location == undefined){
        res.redirect("/")
    } else {
    res.render('shop/maps', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.lenght > 0, location: location})
    }
})

router.post('/maps', function(req, res, next) {
    res.redirect('maps')
})

router.get('/impressum', isAuth, function(req, res, next) {
    var messages = req.flash('error');
    var successMsg = req.flash('success')[0];
    res.render('shop/impressum', { csrfToken: req.csrfToken()})
})

router.get('/datenschutz', isAuth, function(req, res, next) {
    var messages = req.flash('error');
    var successMsg = req.flash('success')[0];
    res.render('shop/datenschutz', { csrfToken: req.csrfToken()})
})

router.get('/getcodes', function(req, res, next){
    function parseDate(input) {
        var parts = input.match(/(\d+)/g);
        if(parts === null || parts[0] > 31) {
           return false
           } else {
        return new Date(parts[2], parts[1]-1, parts[0])
           }
  };
  function today(e)
  {
      var today = new Date(e);
      var dd = today.getDate();
      var mm = today.getMonth()+1;
      var yyyy = today.getFullYear();

      today = dd+'/'+mm+'/'+yyyy;

      return today;   
  }
  function tomorrow(e)
  {
      var today = new Date(e);
      var dd = today.getDate()+1;
      var mm = today.getMonth()+1;
      var yyyy = today.getFullYear();

      today = dd+'/'+mm+'/'+yyyy;

      return today;   
  }
  var fullArray = [];
  var counter = 0;
  User_Order.find(function(err, order) {
      if (err) {
      } else {
          for(var i = 0; i < order.length; i++){
              var thisday = new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0,0,0,0)
              var newday = new Date(order[i].date).setHours(0,0,0,0)
              if(thisday == newday){
                  counter++
                  var thisOrder = ({
                      position: counter,
                      order: order[i]
                  })
                  fullArray.push(thisOrder)
              } 
          }
      }
    //   ewwarruuum
      Order.find(function(err, norder) {
          if (err) {
              console.log("error")
          } else {
              for(var i = 0; i < norder.length; i++){
                  var thisday = new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0,0,0,0)
                  var newday = new Date(norder[i].date).setHours(0,0,0,0)
                  if(newday == thisday){
                      counter++
                  var thisOrder = ({
                      position: counter,
                      order: norder[i]
                  })
                  fullArray.push(thisOrder)
                  } 
              }
          }
          console.log(fullArray)
          res.render('shop/getcodes', { order: fullArray })
      });
  })
})


// router.get("/getcodes", isAuth, function(req, res, next){
//     function parseDate(input) {
//           var parts = input.match(/(\d+)/g);
//           if(parts === null || parts[0] > 31) {
//              return false
//              } else {
//           return new Date(parts[2], parts[1]-1, parts[0])
//              }
//     };
//     var fullArray = [];
//     var counter = 0;
//     User_Order.find(function(err, order) {
//         if (err) {
//         } else {
//             for(var i = 0; i < order.length; i++){
//                 if(new Date(order[i].date).setHours(0,0,0,0) == new Date().setHours(0,0,0,0)){
//                     counter++
//                     var thisOrder = ({
//                         position: counter,
//                         order: order[i]
//                     })
//                     fullArray.push(thisOrder)
//                 } 
//             }
//         }
//         Order.find(function(err, order) {
//             if (err) {
//                 console.log("error")
//             } else {
//                 for(var i = 0; i < order.length; i++){
//                     if(new Date(order[i].date).setHours(0,0,0,0) == new Date().setHours(0,0,0,0)){
//                         counter++
//                     var thisOrder = ({
//                         position: counter,
//                         order: order[i]
//                     })
//                     fullArray.push(thisOrder)
//                     } 
//                 }
//             }
//             console.log(fullArray)
//             res.render('shop/getcodes', { order: fullArray, csrfToken: req.csrfToken()})
//         });
//     })
// })

router.get('/kontakt', isAuth, function(req, res, next) {
    var messages = req.flash('error');
    var successMsg = req.flash('success')[0];
    res.render('shop/kontakt', { csrfToken: req.csrfToken()})
})

router.post('/kontakt', function(req, res, next) {
    mailer.use('compile',hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: 'views/email',
            layoutsDir: 'views/email',
            defaultLayout: 'membermail.hbs',
          },
        viewPath: 'views/email',
        extName: '.hbs'
    }))
    var messages = req.flash('error');
    var successMsg = req.flash('success')[0];
    var nachricht = req.body.nachricht;
    mailer.sendMail({
        from: 'service@brotritter.de',
        to: 'darren.igb@web.de',
        subject: "Anfrage:" + req.body.name,
        template: 'membermail',
        context: {
            nachricht: req.body.nachricht
        }
    },function (err, response){
        if(err){
            req.flash("error", "Ihre Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.");
            res.redirect("/")
        } else {
            req.flash("success", "Ihre Anfrage wird verarbeitet und wir werden uns in Kürze bei Ihnen melden.");
            res.redirect("/");
        }
    })
})

// (*change later when we have more than one bakery*)

router.get('/bakery', isAuth, function(req, res, next) {
    var messages = req.flash('error');  
    var successMsg = req.flash('success')[0];
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = mm + '/' + dd + '/' + yyyy;
    // check if bakery is open
    Bakery.find(function(err, status) {
        console.log(status[0].closed)
        // get all the buns and store them in an array
        Bun.find(function(err, docs) {
            var productChunks = [];
            var chunkSize = 1;
            for (var i = 0; i < docs.length; i+= chunkSize) {
                var then = new Date(docs[i].expdate).getTime()
                var now = new Date().getTime()
                // if store is open and buns aren't available "Heute ausverkauft"
                if (status[0].closed == false){
                    if(docs[i].expdate && then <= now && new Date(docs[i].expdate).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0) && docs[i].expdate){
                        docs[i].unavailable = true;
                    }
                }
                productChunks.push(docs.slice(i, i + chunkSize));
            }
            Credit.findOne({user: req.user}).sort({"_id": -1}).exec(function(err, data)   {
            if (!data){
                var credit = parseFloat(Math.round((0) * 100) / 100).toFixed(2)
            } else {
                var credit = parseFloat(Math.round((data.credit) * 100) / 100).toFixed(2)
            }
            res.render('shop/bakery', {csrfToken: req.csrfToken(), closed: status[0].closed, messages: messages, credit: credit, hasErrors: messages.lenght > 0, products: productChunks, successMsg: successMsg, noMessages: !successMsg})
            })
        })
    })
})

router.post("/bakery", function(req, res, next) {
    mailer.use('compile',hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: 'views/email',
            layoutsDir: 'views/email',
            defaultLayout: 'success.hbs',
          },
        viewPath: 'views/email',
        extName: '.hbs'
    }))
    console.log("yey");
    var bakePost = req.body.payways;
    function code_error(){
        res.redirect("bakery")
    };

    var closed

    Bakery.find(function(err, status) {
        if (status[0].closed == false){
            closed = false
        } else {
            closed = true
        }
    })
    
    function charge_error(){
        req.flash("error", "Nicht Genügend Guthaben!");
        res.redirect("bakery")
    };
    
    function date_error(){
        req.flash("error", "Bitte geben sie ein gültiges Datum an.");
        res.redirect("bakery")
    };
    
    if(req.body.timepicker !== "7:00" && req.body.timepicker !== "8:00" && req.body.timepicker !== "9:00" && req.body.timepicker !== "10:00" && req.body.timepicker !== "11:00" && req.body.timepicker !== "12:00" && req.body.timepicker !== "13:00" && req.body.timepicker !== "14:00" ){
        res.redirect("back");
    } else {  
    
        var time= req.body.timepicker
        var timing = time.split(":");
        var thisTime = new Date().getHours()
        if(req.body.datepicker != undefined && req.body.datepicker != null && req.body.datepicker && new Date(req.body.datepicker) != null && req.body.datepicker.length > 0) {

            var datepicker = req.body.datepicker;
            
            function parseDate(input) {
              var parts = input.match(/(\d+)/g);
              if(parts === null || parts[0] > 31) {
                 return false
                 } else {
              return new Date(parts[2], parts[1]-1, parts[0])
                 }
            }
            var orderday = new Date()
            if (new Date(parseDate(datepicker)).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0) && thisTime > timing[0] || closed == true && parseDate(datepicker).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)){
                console.log("here")
                date_error()
            } else {

            if (new Date(parseDate(datepicker)) !== false && new Date(parseDate(datepicker)).setHours(0,0,0,0) >= orderday.setHours(0,0,0,0) && new Date(parseDate(datepicker)).setHours(0,0,0,0) < orderday.setMonth(orderday.getMonth()+2 ) || datepicker == "Heute") {

                if(datepicker == "Heute"){
                    var day = new Date();
                    var nextDay = new Date(day);
                    var date = nextDay;
                    var m = nextDay.getMonth()+1;
                    var parsedDate = date.getDate() + "." + m + "." + date.getFullYear();
                } else {
                    var date = new Date(parseDate(datepicker));
                    var parsedDate = datepicker;
                    }  
                // Mon May 31 2010 00:00:00
                function randomVar(theCode){
                    User_Order.findOne({code: theCode}).exec(function(err, userorder)   {
                        if (!userorder){
                            Order.findOne({code: theCode}).exec(function(err, order)   {
                                if (!order){
                                    return random
                                } else if (order){
                                    var random = Math.floor(Math.random()*9000) + 1000;
                                    randomVar(random)
                                }
                            })
                        } else if (userorder){
                            var random = Math.floor(Math.random()*9000) + 1000;
                            randomVar(random)
                        }
                    })
                }
                var random = Math.floor(Math.random()*9000) + 1000;
                randomVar(random)
                console.log(req.body.getnumber)
                    if (req.body.getnumber == 1) {
                        Bun.findOne({title: req.body.getname}).exec(function(err, data) {
                            var curdate = new Date().getTime()
                            var expdate = new Date(data.expdate).getTime()
                            console.log(curdate)
                            console.log(expdate)
                            if (!data || curdate >= expdate && new Date(date).setHours(0, 0, 0, 0) == new Date(data.expdate).setHours(0, 0, 0, 0)) {
                                res.redirect("bakery")
                            } else {
                                var total = data.price * req.body[req.body.getname];
                                total = parseFloat(Math.round(total * 100) / 100).toFixed(2);
                                var productorder = req.body.getname;
                                var number = req.body[req.body.getname];
                                if (req.user){
                //                  Substract money from user account
                                    Credit.findOne({user: req.user}).sort({"_id": -1}).exec(function(err, data)   {
                                          if (!data || data.credit < total) {
                                           charge_error()
                                          } else {
                                          data.toObject({ getters: true })
                                          var credit = new Credit({
                                              user: req.user,
                                              credit: parseFloat(Math.round((data.credit - total) * 100) / 100).toFixed(2)
                                              });
                                            credit.save(function(err, result) {
                                                req.flash('success', 'Die Bestellung wurde erfolgreich abgeschlossen.')
                                            })
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
                                            })
                                            user_order.save(function(err, result) {
                                            req.session.code = random;
                                            req.session.cart = productorder;
                                            req.session.amount = number;
                                            req.session.total = total;
                                            req.session.date = date;
                                            req.session.time = time;
                                                mailer.sendMail({
                                                    from: 'service@brotritter.de',
                                                    to: req.user.email,
                                                    subject: "Bestellung Brotritter",
                                                    template: 'success',
                                                    context: {
                                                        code: req.session.code,
                                                        date: parsedDate,
                                                        time: req.session.time,
                                                        cart: req.session.cart,
                                                        amount: req.session.amount
                                                    },
                                                    attachments: [{
                                                        filename: "BrotritterBakery1.jpg",
                                                        path: "./public/images/BrotritterBakery1.jpg",
                                                        cid: "cross"
                                                    },
                                                    {
                                                        filename: "MyLogo.png",
                                                        path: "./public/images/MyLogo.png",
                                                        cid: "logo"
                                                    }]
                                                },function (err, response){
                                                    if(err){
                                                        res.send("bad email");
                                                        console.log(err)
                                                    } else {
                                                        res.redirect("code")
                                                    }
                                                })
                                        });
                                        }
                                    });
                                } else {
                                    var total = parseFloat(Math.round((total -(-0.46)) * 100) / 100).toFixed(2);
                                    if (bakePost === "Paypal"){
                                        console.log(bakePost)
                                        var create_payment_json = {
                                            "intent": "sale",
                                            "payer": {
                                                "payment_method": "paypal"
                                            },
                                            "redirect_urls": {
                                                "return_url": "http://localhost:3000/success",
                                                "cancel_url": "http://localhost:3000/"
                                            },
                                            "transactions": [{
                                                "item_list": {
                                                    "items": [{
                                                        "name": "Bestellung",
                                                        "sku": "001",
                                                        "price": total,
                                                        "currency": "EUR",
                                                        "quantity": 1
                                                    }]
                                                },
                                                "amount": {
                                                    "currency": "EUR",
                                                    "total": total
                                                },
                                                "description": "Danke für den Besuch bei Brotritter"
                                            }]
                                        };

                                        paypal.payment.create(create_payment_json, function (error, payment) {
                                            if (error) {
                                                throw error;
                                            } else {
                                                for(var i = 0; i < payment.links.length; i++){
                                                    if(payment.links[i].rel === "approval_url"){
                                                        req.session.var1 = random;
                                                        req.session.var2 = productorder;
                                                        req.session.var3 = number;
                                                        req.session.var4 = total;
                                                        req.session.var5 = date;
                                                        req.session.var6 = parsedDate;
                                                        req.session.var7 = time;
                                                        req.session.user_email = req.body.email_reader
                                                        res.redirect(payment.links[i].href);
                                                    }
                                                }
                                            }
                                        });
                                    } else if (bakePost === "Creditcard"){
                                                        req.session.var1 = random;
                                                        req.session.var2 = productorder;
                                                        req.session.var3 = number;
                                                        req.session.var4 = total;
                                                        req.session.var5 = date;
                                                        req.session.var6 = parsedDate;
                                                        req.session.var7 = time;
                                                        req.session.user_email = req.body.email_reader;
                                                        if(!req.session.var1) { 
                                                            return res.redirect('/');
                                                        } 

                                                        var stripe = require("stripe")(
                                                            "sk_test_i04III5L3LkQYefZd5605el0"
                                                        );

                                                        stripe.charges.create({
                                                          amount: Math.round(req.session.var4*100),
                                                          currency: "eur",
                                                          source: req.body.stripeToken, // obtained with Stripe.js
                                                          description: "Charge for jenny.rosen@example.com"
                                                        }, function(err, charge) {
                                                          if (err) {
                                                              req.flash('error', err.message);
                                                              return res.redirect('bakery');
                                                          } else {
                                                                console.log(req.session.user_email)
                                                                var order = new Order({
                                                                                    requser: req.session.user_email,
                                                                                    cart: req.session.var2,
                                                                                    amount: req.session.var3,
                                                                                    total: req.session.var4,
                                                                                    code: req.session.var1,
                                                                                    date: req.session.var5,
                                                                                    time: time,
                                                                                    parsedDate: req.session.var6,
                                                                                    today: new Date()
                                                                                })
                                                                order.save(function(err, result) {
                                                                    req.session.code = req.session.var1;
                                                                    req.session.cart = req.session.var2;
                                                                    req.session.amount = req.session.var3;
                                                                    req.session.total = parseFloat(Math.round(req.session.var4 * 100) / 100).toFixed(2);
                                                                    req.session.date = req.session.var5;
                                                                    req.session.parsedDate = req.session.var6;
                                                                    req.session.time = req.session.var7;
                                                                    req.session.var1 = false;
                                                                    req.session.var2 = false;
                                                                    req.session.var3 = false;
                                                                    req.session.var4 = false;
                                                                    req.session.var5 = false;
                                                                    req.session.var6 = false;
                                                                    req.session.var7 = false;
                                                                    req.flash("success", 'Die Bestellung wurde erfolgreich abgeschlossen.');
                                                                    mailer.sendMail({
                                                                        from: 'service@brotritter.de',
                                                                        to:  req.session.user_email,
                                                                        subject: "Bestellung Brotritter",
                                                                        template: 'success',
                                                                        context: {
                                                                            code: req.session.code,
                                                                            date: req.session.parsedDate,
                                                                            cart: req.session.cart,
                                                                             amount: req.session.amount,
                                                                            time: req.session.time
                                                                        },attachments: [{
                                                                            filename: "BrotritterBakery1.jpg",
                                                                            path: "./public/images/BrotritterBakery1.jpg",
                                                                            cid: "cross"
                                                                        },
                                                                        {
                                                                            filename: "MyLogo.png",
                                                                            path: "./public/images/MyLogo.png",
                                                                            cid: "logo"
                                                                        }]
                                                                    },function (err, response){
                                                                        if(err){
                                                                            res.send("bad email");
                                                                            console.log(err)
                                                                        } else {
                                                                            res.redirect("code")
                                                                        }
                                                                    })
                                                                });
                                                            }
                                                        });
                                    } else if(bakePost == "Sofort") {
                                        req.session.var1 = random;
                                        req.session.var2 = productorder;
                                        req.session.var3 = number;
                                        req.session.var4 = total;
                                        req.session.var5 = date;
                                        req.session.var6 = parsedDate;
                                        req.session.var7 = time;
                                        req.session.user_email = req.body.email_reader;
                                        if(!req.session.var1) {
                                            return res.redirect('/');
                                        }
                                        try {
                                            Sofort.createPayment(total, 'EUR', ['Demo1'], {
                                                user_variables: ['variable1','variable2','variable3'],
                                                success_url: 'http://localhost:3000/sofort/success1/-TRANSACTION-',
                                                success_link_redirect: true}, function (err, data) {
                                                if(err){
                                                    req.flash('error', err.message);
                                                    return res.redirect('bakery');
                                                } else {
                                                    res.redirect(data.payment_url)
                                                }
                                            });
                                        } catch (e) {
                                            console.log(e);
                                        }
                                    }
                                }
                            }
                        })
                    } else {
                        var total = 0;
                        var productorder = [];
                        var number = [];
                        var counter = 0;
                        var error = 0;
                        var Errorloop = 0;
                        var decimal=  /^[-+]?[0-9]+\.[0-9]+$/
                        var bodylegth = req.body.getname.length;
                        for (var i = 0; i < bodylegth; i++){
                            if (req.body[req.body.getname[i]] < 1 || req.body[req.body.getname[i]].match(decimal) || !req.body[req.body.getname[i]] || isNaN(req.body[req.body.getname[i]])){
                                error++;
                            }
                        }
                        if (error > 0) {
                            code_error()
                        } else {
                            req.body.getname.forEach(function(broname) {
                                    Bun.findOne({title: broname}, function(err, data) {
                                        var curdate = new Date().getTime()
                                        var expdate = new Date(data.expdate).getTime()
                                        console.log(curdate)
                                        console.log(expdate)
                                       if (!data || curdate >= expdate && new Date(date).setHours(0, 0, 0, 0) == new Date(data.expdate).setHours(0, 0, 0, 0)) {
                                           Errorloop++
                                           counter++
                                           console.log("hi")
                                           console.log(req.body.getname.lenght)
                                           if (Errorloop > 0 && counter == req.body.getname.lenght) {
                                                code_error()
                                           }
                                        } else {
                                            console.log(broname)
                                            console.log(req.body[broname])
                                            total -= -data.price * req.body[broname]
                                            counter++;
                                            productorder.push(broname);
                                            number.push(req.body[broname])
                                            if (Errorloop > 0 && counter == req.body.getname.lenght) {
                                                code_error()
                                            } else if (counter == req.body.getname.length){
                                                if (req.user){
                                                    Credit.findOne({user: req.user}).sort({"_id": -1}).exec(function(err, data)   {
                                                      if (!data || data.credit < total) {
                                                       charge_error()
                                                      } else {
                                                      data.toObject({ getters: true })
                                                      var credit = new Credit({
                                                          user: req.user,
                                                          credit: parseFloat(Math.round((data.credit - total) * 100) / 100).toFixed(2)
                                                          });
                                                        credit.save(function(err, result) {
                                                        })
                                                        var user_order = new User_Order({
                                                            user: req.user,
                                                            email: req.user.email,
                                                            cart: productorder,
                                                            amount: number,
                                                            total: parseFloat(Math.round(total * 100) / 100).toFixed(2),
                                                            code: random,
                                                            date: date,
                                                            time: time,
                                                            parsedDate: parsedDate,
                                                            today: new Date()
                                                        })
                                                        user_order.save(function(err, result) {
                                                        req.session.code = random;
                                                        req.session.cart = productorder;
                                                        req.session.amount = number;
                                                        req.session.total = parseFloat(Math.round(total * 100) / 100).toFixed(2);
                                                        req.session.date = date;
                                                        req.session.time = time;
                                                        mailer.sendMail({
                                                            from: 'service@brotritter.de',
                                                            to: req.user.email,
                                                            subject: "Bestellung Brotritter",
                                                            template: 'success',
                                                            context: {
                                                                code: req.session.code,
                                                                date: parsedDate,
                                                                time: req.session.time,
                                                                cart: req.session.cart,
                                                                amount: req.session.amount
                                                            },
                                                            attachments: [{
                                                                filename: "BrotritterBakery1.jpg",
                                                                path: "./public/images/BrotritterBakery1.jpg",
                                                                cid: "cross"
                                                            },
                                                            {
                                                                filename: "MyLogo.png",
                                                                path: "./public/images/MyLogo.png",
                                                                cid: "logo"
                                                            }],
                                                        },function (err, response){
                                                            if(err){
                                                                res.send("bad email");
                                                                console.log(err)
                                                            } else {
                                                                req.flash("success", 'Die Bestellung wurde erfolgreich abgeschlossen.')
                                                                module.exports = function(io){
                                                                    console.log(io)
                                                                    router.get('/', function(req, res, next){
                                                                        io.emit("message", "your message");
                                                                        res.send();
                                                                    })
                                                                    // edited
                                                                    return router;
                                                                }
                                                                res.redirect("code")
                                                            }
                                                        })
                                                    });
                                                      }
                                                    });
                                                } else {
                                                    console.log(total)
                                                    var totalPrice =  parseFloat(Math.round((total -(-0.46)) * 100) / 100).toFixed(2);
                                                    console.log(totalPrice)
                                                    if (bakePost === "Paypal"){
                                                        console.log(bakePost)
                                                        var create_payment_json = {
                                                            "intent": "sale",
                                                            "payer": {
                                                                "payment_method": "paypal"
                                                            },
                                                            "redirect_urls": {
                                                                "return_url": "http://localhost:3000/success",
                                                                "cancel_url": "http://localhost:3000/"
                                                            },
                                                            "transactions": [{
                                                                "item_list": {
                                                                    "items": [{
                                                                        "name": "Bestellung",
                                                                        "sku": "001",
                                                                        "price": parseFloat(Math.round(totalPrice * 100) / 100).toFixed(2),
                                                                        "currency": "EUR",
                                                                        "quantity": 1
                                                                    }]
                                                                },
                                                                "amount": {
                                                                    "currency": "EUR",
                                                                    "total": parseFloat(Math.round(totalPrice * 100) / 100).toFixed(2),
                                                                },
                                                                "description": "Brottüte der gewählten Bäckerei"
                                                            }]
                                                        };


                                                        paypal.payment.create(create_payment_json, function (error, payment) {
                                                            if (error) {
                                                                throw error;
                                                            } else {
                                                                for(var i = 0; i < payment.links.length; i++){
                                                                    if(payment.links[i].rel === "approval_url"){
                                                                        req.session.var1 = random;
                                                                        req.session.var2 = productorder;
                                                                        req.session.var3 = number;
                                                                        req.session.var4 = parseFloat(Math.round(totalPrice * 100) / 100).toFixed(2);
                                                                        req.session.var5 = date;
                                                                        req.session.var6 = parsedDate;
                                                                        req.session.var7 = time;
                                                                        req.session.user_email = req.body.email_reader;
                                                                        res.redirect(payment.links[i].href);
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    } else if (bakePost === "Creditcard"){
                                                        req.session.var1 = random;
                                                        req.session.var2 = productorder;
                                                        req.session.var3 = number;
                                                        req.session.var4 = parseFloat(Math.round(totalPrice * 100) / 100).toFixed(2);
                                                        req.session.var5 = date;
                                                        req.session.var6 = parsedDate;
                                                        req.session.var7 = time;
                                                        req.session.user_email = req.body.email_reader;
                                                        if(!req.session.var1) {
                                                            return res.redirect('/');
                                                        }

                                                        var stripe = require("stripe")(
                                                            "sk_test_i04III5L3LkQYefZd5605el0"
                                                        );

                                                        stripe.charges.create({
                                                          amount: Math.round(req.session.var4*100),
                                                          currency: "eur",
                                                          source: req.body.stripeToken, // obtained with Stripe.js
                                                          description: "Charge for jenny.rosen@example.com"
                                                        }, function(err, charge) {
                                                          if (err) {
                                                              req.flash('error', err.message);
                                                              return res.redirect('bakery');
                                                          } else {
                                                                console.log(req.session.user_email)
                                                                var order = new Order({
                                                                    requser: req.session.user_email,
                                                                    cart: req.session.var2,
                                                                    amount: req.session.var3,
                                                                    total: req.session.var4,
                                                                    code: req.session.var1,
                                                                    date: req.session.var5,
                                                                    time: time,
                                                                    parsedDate: req.session.var6,
                                                                    today: new Date()
                                                                })
                                                                order.save(function(err, result) {
                                                                    req.session.code = req.session.var1;
                                                                    req.session.cart = req.session.var2;
                                                                    req.session.amount = req.session.var3;
                                                                    req.session.total = parseFloat(Math.round(req.session.var4 * 100) / 100).toFixed(2);
                                                                    req.session.date = req.session.var5;
                                                                    req.session.parsedDate = req.session.var6;
                                                                    req.session.time = req.session.var7;
                                                                    req.session.var1 = false;
                                                                    req.session.var2 = false;
                                                                    req.session.var3 = false;
                                                                    req.session.var4 = false;
                                                                    req.session.var5 = false;
                                                                    req.session.var6 = false;
                                                                    req.session.var7 = false;
                                                                    req.flash("success", 'Die Bestellung wurde erfolgreich abgeschlossen.');
                                                                    mailer.sendMail({
                                                                        from: 'service@brotritter.de',
                                                                        to:  req.session.user_email,
                                                                        subject: "Bestellung Brotritter",
                                                                        template: 'success',
                                                                        context: {
                                                                            code: req.session.code,
                                                                            date: req.session.parsedDate,
                                                                            cart: req.session.cart,
                                                                            amount: req.session.amount,
                                                                            time: req.session.time
                                                                        },
                                                                        attachments: [{
                                                                            filename: "BrotritterBakery1.jpg",
                                                                            path: "./public/images/BrotritterBakery1.jpg",
                                                                            cid: "cross"
                                                                        },
                                                                        {
                                                                            filename: "MyLogo.png",
                                                                            path: "./public/images/MyLogo.png",
                                                                            cid: "logo"
                                                                        }],
                                                                    },function (err, response){
                                                                        if(err){
                                                                            res.send("bad email");
                                                                            console.log(err)
                                                                        } else {
                                                                            res.redirect("code")
                                                                        }
                                                                    })
                                                                });
                                                            }
                                                        });
                                                    }
                                                    else if (bakePost == "Sofort") {
                                                        req.session.var1 = random;
                                                        req.session.var2 = productorder;
                                                        req.session.var3 = number;
                                                        req.session.var4 = parseFloat(Math.round(totalPrice * 100) / 100).toFixed(2);
                                                        req.session.var5 = date;
                                                        req.session.var6 = parsedDate;
                                                        req.session.var7 = time;
                                                        req.session.user_email = req.body.email_reader;
                                                        if(!req.session.var1) {
                                                            return res.redirect('/');
                                                        }
                                                        try {
                                                            Sofort.createPayment(req.session.var4, 'EUR', ['Demo1'], {
                                                                user_variables: ['variable1','variable2','variable3'],
                                                                success_url: 'http://localhost:3000/sofort/success1/-TRANSACTION-',
                                                                success_link_redirect: true}, function (err, data) {
                                                                if(err){
                                                                    req.flash('error', err.message);
                                                                    return res.redirect('bakery');
                                                                } else {
                                                                    res.redirect(data.payment_url)
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.log(e);
                                                        }
                                                    }
                                        }
                                    }}})
                            })
                        }
                    }
            } else {
                console.log("num1")
                date_error()
            }
        }
        } else {
            console.log("num2")
            date_error()
        }
    }
})

// router.post('/checkout', function(req, res, next) {
//     if(!req.session.var1) {
//         return res.redirect('/');
//     }
        
//     var stripe = require("stripe")(
//         "sk_live_IO6Ha8nD2fBrJDZDji9g2PwW"
//     );

//     stripe.charges.create({
//       amount: Math.round(req.session.var4*100),
//       currency: "eur",
//       source: req.body.stripeToken, // obtained with Stripe.js
//       description: "Charge for jenny.rosen@example.com"
//     }, function(err, charge) {
//       if (err) {
//           req.flash('error', err.message);
//           return res.redirect('checkout');
//       } else {
//             console.log(req.session.user_email)
//             var order = new Order({
//                                 requser: req.session.user_email,
//                                 cart: req.session.var2,
//                                 amount: req.session.var3,
//                                 total: req.session.var4,
//                                 code: req.session.var1,
//                                 date: req.session.var5,
//                                 parsedDate: req.session.var6,
//                                 today: new Date()
//                             })
//             order.save(function(err, result) {
//                 req.session.code = req.session.var1;
//                 req.session.cart = req.session.var2;
//                 req.session.amount = req.session.var3;
//                 req.session.total = parseFloat(Math.round(req.session.var4 * 100) / 100).toFixed(2);
//                 req.session.date = req.session.var5;
//                 req.session.parsedDate = req.session.var6;
//                 req.session.var1 = false;
//                 req.session.var2 = false;
//                 req.session.var3 = false;
//                 req.session.var4 = false;
//                 req.session.var5 = false;
//                 req.session.var6 = false;
//                 req.flash("success", 'Die Bestellung wurde erfolgreich abgeschlossen');
//                 mailer.sendMail({
//                     from: 'service@brotritter.de',
//                     to:  req.session.user_email,
//                     subject: "Bestellung Brotritter",
//                     template: 'success',
//                     context: {
//                         code: req.session.code,
//                         date: req.session.parsedDate
//                     }
//                 },function (err, response){
//                     if(err){
//                         res.send("bad email");
//                         console.log(err)
//                     } else {
//                         res.redirect("code")
//                     }
//                 })
//             });
//         }
//     });
// })

router.get('/success', isAuth, function(req, res, next) {
    var payerId = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "EUR",
                "total": parseFloat(Math.round(req.session.var4 * 100) / 100).toFixed(2)
            },
        }]
    }
    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
        mailer.use('compile',hbs({
            viewEngine: {
                extName: '.hbs',
                partialsDir: 'views/email',
                layoutsDir: 'views/email',
                defaultLayout: 'success.hbs',
              },
            viewPath: 'views/email',
            extName: '.hbs'
        }))
        if(error){
            console.log(error.response);
            throw error
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            console.log(req.session.user_email)
            var order = new Order({
                                requser: req.session.user_email,
                                cart: req.session.var2,
                                amount: req.session.var3,
                                total: req.session.var4,
                                code: req.session.var1,
                                date: req.session.var5,
                                parsedDate: req.session.var6,
                                today: new Date()
                            })
            order.save(function(err, result) {
                req.session.code = req.session.var1;
                req.session.cart = req.session.var2;
                req.session.amount = req.session.var3;
                req.session.total = parseFloat(Math.round(req.session.var4 * 100) / 100).toFixed(2);
                req.session.date = req.session.var5;
                req.session.parsedDate = req.session.var6;
                req.session.var1 = false;
                req.session.var2 = false;
                req.session.var3 = false;
                req.session.var4 = false;
                req.session.var5 = false;
                req.session.var6 = false;
                req.flash("success", 'Die Bestellung wurde erfolgreich abgeschlossen.');
                mailer.sendMail({
                    from: 'service@brotritter.de',
                    to:  req.session.user_email,
                    subject: "Bestellung Brotritter",
                    template: 'success',
                    context: {
                        code: req.session.code,
                        date: req.session.parsedDate
                    }
                },function (err, response){
                    if(err){
                        res.send("bad email");
                        console.log(err)
                    } else {
                        res.redirect("code")
                    }
                })
            });
        }
    })
})
    
router.get('/code', isAuth, function(req, res, next) {
//    if (req.session.code){
        var errors = req.flash('error');
        var success = req.flash('success');
        var code = req.session.code;
        var order = req.session.cart;
        var total = req.session.total;
        var amount = req.session.amount;
        var date = new Date(req.session.date);
        var time = req.session.time;
        var m = new Date(date).getMonth() + 1;
        var parsedDate = date.getDate() + "." + m + "." + date.getFullYear();
        Credit.findOne({user: req.user}).sort({"_id": -1}).exec(function(err, data)   {
        if (!data){
            var credit = parseFloat(Math.round((0) * 100) / 100).toFixed(2)
        } else {
            var credit = parseFloat(Math.round((data.credit) * 100) / 100).toFixed(2)
        }
            if (Array.isArray(order)){
                res.render('shop/code', {csrfToken: req.csrfToken(), code: code, array: order, total: total, amount: amount, errors: errors, success: success, credit: credit, date: parsedDate, time: time})
            } else {
                res.render('shop/code', {csrfToken: req.csrfToken(), code: code, credit: credit, string: order, total: total, amount: amount, errors: errors, success: success, date: parsedDate, time: time})
            }
        })
//    } else {
//        res.redirect("/")
//    }
});

router.get('/forgot', isAuth, function(req, res, next) {
    var errors = req.flash("error");
    var success = req.flash("success")
    res.render('shop/forgot', {csrfToken: req.csrfToken(), errors: errors, success: success});
});

router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex')
                done(err, token) 
            });
        },
        function(token, done) {
            User.findOne({email: req.body.email}, function(err, user) {
                if(!user) {
                    req.flash('error', 'Es gibt keinen Account mit dieser Email.');
                    return res.redirect('forgot');
                }
                
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                
                user.save(function(err) {
                    done(err, token, user)
                });
            });
        },
        function(token, user, done) {
            mailer.use('compile',hbs({
                viewEngine: {
                    extName: '.hbs',
                    partialsDir: 'views/email',
                    layoutsDir: 'views/email',
                    defaultLayout: 'forgot.hbs',
                  },
                viewPath: 'views/email',
                extName: '.hbs'
            }))
            mailer.sendMail({
                    from: 'service@brotritter.de',
                    to:  user.email,
                    subject: "Brotritter: Passwort vergessen",
                    template: 'forgot',
                    context: {
                        link: 'http://' + req.headers.host + '/reset/' + token + '\n\n'
                    },
                    attachments: [{
                        filename: "BrotritterBakery1.jpg",
                        path: "./public/images/BrotritterBakery1.jpg",
                        cid: "cross"
                    },
                    {
                        filename: "MyLogo.png",
                        path: "./public/images/MyLogo.png",
                        cid: "logo"
                    }]
                },function (err, response){
                    if(err){
                        res.send("bad email");
                        console.log(err)
                    } else {
                        req.flash("success", 'Eine E-mail wurde an' +" " + user.email+ " " + "gesendet. Die E-Mail enthält weitere Schritte zur Änderung des Passworts.");
                        res.redirect("forgot")
                    }
            })
        }
    ], function(err) {
        res.redirect('forgot');
    });
});

router.get('/reset/:token', isAuth, function(req, res) {
    var errors = req.flash("error")
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now() } }, function(err, user) {
        if (!user) {
            res.redirect('/forgot');
        } else {
        res.render('shop/reset', {token: req.params.token, csrfToken: req.csrfToken(), errors: errors});
        }
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now() } }, function(err, user) {
                if (!user) {
                    res.redirect('forgot');
                } else if (req.body.password.length <= 4) {
                    req.flash("error", "Das Passwort muss mindestens 5 Zeichen haben.");
                    res.redirect('back');
                }
                else if(req.body.password === req.body.confirm) {
                    user.password = user.encryptPassword(req.body.password);
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        user.save(function(err) {
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                } else {
                    req.flash("error", "Die Passwörter sind nicht gleich.");
                    res.redirect('back');
                }
            });
        },
        function(user, done) {
            mailer.use('compile',hbs({
                viewEngine: {
                    extName: '.hbs',
                    partialsDir: 'views/email',
                    layoutsDir: 'views/email',
                    defaultLayout: 'reset.hbs',
                  },
                viewPath: 'views/email',
                extName: '.hbs'
            }))
            mailer.sendMail({
                    from: 'service@brotritter.de',
                    to:  user.email,
                    subject: "Brotritter: Passwort wurde geändert",
                    template: 'reset',
                    context: {
                        user: user.email
                    }
                },function (err, response){
                    if(err){
                        res.send("bad email");
                        console.log(err)
                    } else {
                        req.flash("success", "Ihr Passwort wurde erfolgreich geändert.")
                        res.redirect("/")
                    }
            })
        }
    ], function(err) {
        res.redirect("/")
    });
});


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
};

function isAuth(req, res, next) {
//    if (req.session.auth) {
//        return next();
//    }else{
//        res.redirect("auth")
//    }
    return next()
}

