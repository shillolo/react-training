var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var flash = require('connect-flash');
var Order = require('../models/order');
var Transfer = require('../models/transfer');
var Credit = require('../models/credit');
var User_Order = require('../models/user-order');
var User = require('../models/breaduser');
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var paypal = require('paypal-rest-sdk');
var validator = require('validator');
var EmailTemplate = require("email-templates");
var Promise = require("bluebird");
var nodemailer = require("nodemailer");
var hbs = require('nodemailer-express-handlebars');
var TransactionID = require('../models/transactionId');

var util = require('util');
var Sofort = new (require('node-sofort'))({
		configKey : '181556:493374:5c3627c5d50e1f77ee0f5824abb46084'
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
                
            var transfer = new Transfer({
                user: req.user,
                charges: req.session.credit,
            });
            Credit.findOne({user: req.user}).sort({"_id": -1}).exec(function(err, data)   {
              if (!data) {
              var credit = new Credit({
              user: req.user,
              credit: parseFloat(Math.round((req.session.credit) * 100) / 100).toFixed(2)
              })
              } else {
              data.toObject({ getters: true })
              var credit = new Credit({
                  user: req.user,
                  credit: parseFloat(Math.round((req.session.credit-(-data.credit)) * 100) / 100).toFixed(2)
                  });
              }
                 credit.save(function(err, result) {
                    console.log(credit)
                })
            });
            transfer.save(function(err, result) {
            req.session.credit = false;
            req.flash('success', 'Ihr Konto wurde erfolgreich aufgeladen.');
            res.redirect('/');
          });
            })
        } else {
            res.redirect("/")
            console.log("swed")
        }
    })
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


var csrfProtection = csrf();
router.use(csrfProtection);

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'Abx37uE9IJbqZsQ6YJZW0a92vzM_5tI5oLpIW-gjpUX0Z38Tbjbk7vxGDXrNAOF4-otvrNf1F-aDY7TT',
  'client_secret': 'ELHy8TSvf7KiXH5s8xlmWCo4McmxopjgofbX2bmWCcH6Ns_cm1Mese0rthYVbQ80mUQyNjp2qowVpShs'
});

router.post('/changetime', isLoggedIn, function(req, res, next) {
    var errors = req.flash("error");
    var success = req.flash("success");
    var picker_id = req.body.datepicker_id;
    
    function redirectBack(){
        res.redirect("back")
    }

    if (Object.prototype.toString.call( picker_id ) !== '[object Array]') {
        if (req.body["timepicker"+picker_id] !== "7:00" && req.body["timepicker"+picker_id] !== "8:00" && req.body["timepicker"+picker_id] !== "9:00" && req.body["timepicker"+picker_id] !== "10:00" && req.body["timepicker"+picker_id] !== "11:00" && req.body["timepicker"+picker_id] !== "12:00" && req.body["timepicker"+picker_id] !== "13:00" && req.body["timepicker"+picker_id] !== "14:00" ) {
            res.redirect("back")
        } else {
            
        } User_Order.findOne({_id: picker_id, user: req.user}).exec(function(err, data)   {
            if (err){
                res.redirect("back")
            } else if (data){
                data.time = timeid;
                data.save(function(){
                    req.flash("success", "Die Abholzeit wurde erfolgreich geändert.");
                    res.redirect("back")
                })
            }
        }) 
    } else {
        var counter = 0;
        var errorcounter = 0;
        picker_id.forEach(function(getid){
            User_Order.findOne({_id: getid, user: req.user}).exec(function(err, data)   {
                var newTime = req.body["timepicker"+getid];
                if(!data || err){
                    counter++;
                    errorcounter++;
                    if (errorcounter > 0 && counter == picker_id.length){
                        res.redirect("back")
                    }
                } else {
                    if (newTime !== "7:00" && newTime !== "8:00" && newTime !== "9:00" && newTime !== "10:00" && newTime !== "11:00" && newTime !== "12:00" && newTime !== "13:00" && newTime !== "14:00" ){
                        counter++;
                        errorcounter++;
                        if (errorcounter > 0 && counter == picker_id.length){
                            res.redirect("back")
                        }
                    } else {
                        counter++;
                        data.time = newTime;
                        data.save()
                            if (counter == picker_id.length && errorcounter == 0){
                                req.flash("success", "Die Abholzeit wurde erfolgreich geändert.");
                                res.redirect("back")
                            }
                    }
                }

            })}
)}
});

router.get('/profile', isLoggedIn, function(req, res, next) {
    var errors = req.flash("error");
    var success = req.flash("success");
    
    User_Order.find({user: req.user}, function(err, order) {
        var newOrder = [];
        var oldOrder = [];
        if (err) {
            return res.write('Error!');
        } else {
            for(var i = 0; i < order.length; i++){
                if(new Date(order[i].date) <= new Date().setHours(0,0,0,0)){
                    oldOrder.push(order[i])
                } else {
                    newOrder.push(order[i])
                }
            }
                var cart;
                Credit.findOne({user: req.user}).sort({"_id": -1}).exec(function(err, data)   {
                if (!data){
                    var credit = parseFloat(Math.round((0) * 100) / 100).toFixed(2)
                } else {
                    var credit = parseFloat(Math.round((data.credit) * 100) / 100).toFixed(2)
                }
                res.render('user/profile', { neworders: newOrder, oldorders: oldOrder, credit: credit, csrfToken: req.csrfToken(), errors: errors, success: success})
                })
        }
    });
});

router.post('/profile', isLoggedIn, function(req, res, next){
    
    function invalidDate(){
        req.flash('error', "Ungültiges Datum");
        res.redirect("back")
    }
        
    var picker_id = req.body.datepicker_id;
    var counter = 0;
    var errorcounter = 0;
    if (Object.prototype.toString.call( picker_id ) !== '[object Array]') {
        User_Order.findOne({_id: picker_id, user: req.user}).exec(function(err, data)   { 
            if(!data){
                counter++;
                errorcounter++;
                if (errorcounter > 0 && counter == 1){
                    invalidDate()
                }
            } else {
            if (errorcounter > 0 && counter == 1){
                    invalidDate()
            } else {
                if (errorcounter > 0 && counter == 1){
                    invalidDate()
                }
                var getdate = req.body[picker_id];
                if(getdate != undefined && getdate != null && getdate && new Date(getdate) != null && getdate.length > 0) {

                    function parseDate(input) {
                      var parts = input.match(/(\d+)/g);
                      if(parts === null || parts[0] > 31) {
                         return false
                         } else {
                      return new Date(parts[2], parts[1]-1, parts[0])
                         }
                    }

                    var orderday = new Date()
                    
                    if (new Date().setHours(0,0,0,0) == new Date(parseDate(data.date)).setHours(0,0,0,0)){
                        counter++;
                        errorcounter++;
                        if (errorcounter > 0 && counter == 1){
                            invalidDate()
                        }
                    } else if (new Date(parseDate(getdate)) !== false && new Date(parseDate(getdate)).setHours(0,0,0,0) > orderday && new Date(parseDate(getdate)).setHours(0,0,0,0) < orderday.setMonth(orderday.getMonth()+2)) {
                        counter++;
                        if (errorcounter > 0 && counter == 1){
                            invalidDate()
                        } else {
                            data.date = new Date(parseDate(getdate));
                            data.parsedDate = getdate;
                            data.save();
                            if (counter == 1 && errorcounter == 0){
                                req.flash('success', 'Das Abholdatum Ihrer Bestellungen wurde erfolgreich geändert.')
                                res.redirect("back");
                            }
                        }
                    } else {
                        counter++;
                        errorcounter++;
                        if (errorcounter > 0 && counter == 1){
                            invalidDate()
                        }
                    }
                } else {
                    counter++;
                    errorcounter++;
                    if (errorcounter > 0 && counter == 1){
                        invalidDate()
                    }
                }
            }
            }
        })
    } else {
        picker_id.forEach(function(getid){
            User_Order.findOne({_id: getid, user: req.user}).exec(function(err, data)   { 
                if(!data){
                    counter++;
                    errorcounter++;
                    if (errorcounter > 0 && counter == picker_id.length){
                        invalidDate()
                    }
                } else {
                if (errorcounter > 0 && counter == picker_id.length){
                        invalidDate()
                } else {
                    if (errorcounter > 0 && counter == picker_id.length){
                        invalidDate()
                    }
                    var getdate = req.body[getid];
                    if(getdate != undefined && getdate != null && getdate && new Date(getdate) != null && getdate.length > 0) {

                        function parseDate(input) {
                          var parts = input.match(/(\d+)/g);
                          if(parts === null || parts[0] > 31) {
                             return false
                             } else {
                          return new Date(parts[2], parts[1]-1, parts[0])
                             }
                        }

                        var orderday = new Date()

                        if (new Date().setHours(0,0,0,0) == new Date(parseDate(data.date)).setHours(0,0,0,0)){
                            counter++;
                            errorcounter++;
                            if (errorcounter > 0 && counter == picker_id.length){
                                invalidDate()
                            }
                        } else if (new Date(parseDate(getdate)) !== false && new Date(parseDate(getdate)).setHours(0,0,0,0) > orderday && new Date(parseDate(getdate)).setHours(0,0,0,0) < orderday.setMonth(orderday.getMonth()+2)) {
                            counter++;
                            if (errorcounter > 0 && counter == picker_id.length){
                                invalidDate()
                            } else {
                                data.date = new Date(parseDate(getdate));
                                data.parsedDate = getdate;
                                data.save();
                                if (counter == picker_id.length && errorcounter == 0){
                                    req.flash('success', 'Das Abholdatum Ihrer Bestellungen wurde erfolgreich geändert.')
                                    res.redirect("back");
                                }
                            }
                        } else {
                            counter++;
                            errorcounter++;
                            if (errorcounter > 0 && counter == picker_id.length){
                                invalidDate()
                            }
                        }
                    } else {
                        counter++;
                        errorcounter++;
                        if (errorcounter > 0 && counter == picker_id.length){
                            invalidDate()
                        }
                    }
                }
                }
            })
        })
        }
})  

router.post("/delete", isLoggedIn, function(req, res, next) {
    var orderId = req.body.order;
    User_Order.findOne({_id: orderId, user: req.user}).exec(function(err, order)   {
        if (err){
            res.redirect("profile")
        }
        order.remove();
        order.save(function(err, done){
            Credit.findOne({user: req.user}).sort({"_id": -1}).exec(function(err, data)   {
                data.credit = data.credit - (-order.total);
                data.save(function(wrong, go){
                    req.session.code = false;
                    req.session.cart = false;
                    req.session.amount = false;
                    req.session.total = false;
                    req.session.date = false;
                    req.session.time = false;
                    req.flash("success", "Bestellung wurde erfolgreich gelöscht.")
                    res.redirect("back")
                })
            })
        })
    })
})

router.get('/logout', isLoggedIn, function(req, res, next) {
    req.logout();
    res.redirect('/');
})

router.get('/changemail', isLoggedIn, function(req, res, next) {
    var errMsg = req.flash('error')[0];
    var successMsg = req.flash('success')[0];
    Credit.findOne({user: req.user}).sort({"_id": -1}).exec(function(err, data)   {
        if (!data){
        var credit = parseFloat(Math.round((0) * 100) / 100).toFixed(2)
        } else {
            var credit = parseFloat(Math.round((data.credit) * 100) / 100).toFixed(2)
        }
        res.render('user/changemail', {csrfToken: req.csrfToken(), errors: errMsg, success: successMsg, credit: credit})
    })
})

router.post('/changemail', isLoggedIn, function(req, res, next) {
    var errMsg = req.flash('error')[0];
    if (errMsg) {
        console.log(errMsg)
    }
    User.findOne({email: req.user.email}).sort({"_id": -1}).exec(function(err, userdata) {
        if (validator.isEmail(req.body.email)){
            User.findOne({email: req.body.email}).sort({"_id": -1}).exec(function(error, data) {
                if (data == null){
                userdata.email = req.body.email;
                userdata.save(function(){
                    mailer.use('compile',hbs({
                        viewEngine: {
                            extName: '.hbs',
                            partialsDir: 'views/email',
                            layoutsDir: 'views/email',
                            defaultLayout: 'changed.hbs',
                          },
                        viewPath: 'views/email',
                        extName: '.hbs'
                    }));
                    mailer.sendMail({
                        from: 'service@brotritter.de',
                        to: req.user.email,
                        subject: "E-Mail geändert Brotritter",
                        template: 'changed',
                        context: {
                            oldmail: req.user.email,
                            newmail: req.body.email
                        }
                    },function (err, response){
                        if(err){
                            res.send("bad email");
                        }
                    })
                    req.flash('success', 'Ihre E-Mail Adresse wurde erfolgreich geändert.');
                    res.redirect("profile")
                })
                } else {
                    req.flash('error', 'Diese E-Mail Adresse ist bereits angemeldet.');
                    res.redirect("back")
                }
            })
        } else {
            req.flash('error', 'Ungültige E-Mail Adresse');
            res.redirect("back")
        }
    })
})

router.get('/aufladen', isLoggedIn, function(req, res, next) {
    var errMsg = req.flash('error')[0];
    if (errMsg) {
        console.log(errMsg)
    }
    Credit.findOne({user: req.user}).sort({"_id": -1}).exec(function(err, data)   {
        if (!data){
        var credit = parseFloat(Math.round((0) * 100) / 100).toFixed(2)
        } else {
            var credit = parseFloat(Math.round((data.credit) * 100) / 100).toFixed(2)
        }
        res.render('user/aufladen', {csrfToken: req.csrfToken(), errMsg: errMsg, noError: !errMsg, credit: credit})
    })
})

router.post('/aufladen', isLoggedIn, function(req, res, next) {
    var bakePost = req.body.payways;
    var value = req.body.guthaben;
    if (!isNaN(value) || value !== "" || value >= 5 || value <= 200 ){
     if (bakePost === "Paypal"){
        console.log(bakePost)
        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/user/charged",
                "cancel_url": "http://localhost:3000/"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Bestellung",
                        "sku": "001",
                        "price": (Math.round((req.body.guthaben) * 100) / 100).toFixed(2),
                        "currency": "EUR",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "EUR",
                    "total": parseFloat(Math.round((req.body.guthaben) * 100) / 100).toFixed(2)
                },
                "description": "Danke für den Besuch bei Brotritter"
            }]
        };


        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                res.redirect("back")
            } else {
                for(var i = 0; i < payment.links.length; i++){
                    if(payment.links[i].rel === "approval_url"){
                        req.session.credit = req.body.guthaben;
                        res.redirect(payment.links[i].href);
                    }
                }
            }
        });
    } else if (bakePost === "Creditcard"){
        req.session.credit = req.body.guthaben;
        
        if(!req.session.credit) {
        return res.redirect('/');
    }
      
        //        "sk_live_IO6Ha8nD2fBrJDZDji9g2PwW"
        
    var stripe = require("stripe")(
        "sk_test_i04III5L3LkQYefZd5605el0"
    );
        console.log("hier1")
    stripe.charges.create({
      amount: Math.round(req.session.credit*100),
      currency: "eur",
      source: req.body.stripeToken, // obtained with Stripe.js
      description: "Charge for jenny.rosen@example.com"
    }, function(err, charge) {
      if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
      } else {
            var transfer = new Transfer({
                user: req.user,
                charges: req.session.credit,
              });
            Credit.findOne({user: req.user}).sort({"_id": -1}).exec(function(err, data)   {
                        console.log("hier3")
              if (!data) {
              var credit = new Credit({
              user: req.user,
              credit: parseFloat(Math.round((req.session.credit) * 100) / 100).toFixed(2)
              })
              } else {
              data.toObject({ getters: true })
              var credit = new Credit({
                  user: req.user,
                  credit: parseFloat(Math.round((req.session.credit-(-data.credit)) * 100) / 100).toFixed(2)
                  });
              }
                 credit.save(function(err, result) {
                    console.log(credit)
                })
            });
            transfer.save(function(err, result) {
          req.session.credit = false;
          req.flash('success', 'Ihr Konto wurde erfolgreich aufgeladen');
          res.redirect('/');
      });
        }
    });
    } else if(bakePost == "Sofort") {
        req.session.credit = req.body.guthaben;

        try {
            Sofort.createPayment(parseFloat(Math.round((req.session.credit) * 100) / 100).toFixed(2), 'EUR', ['Demo1'], {
                user_variables: ['variable1','variable2','variable3'],
                success_url: 'http://localhost:3000/user/sofort/success2/-TRANSACTION-',
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
});

router.get('/charged', function(req, res, next) {
    var payerId = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "EUR",
                "total": parseFloat(Math.round(req.session.credit * 100) / 100).toFixed(2)
            },
        }]
    }
    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
        if(error){
            console.log(error.response);
            throw error
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            var transfer = new Transfer({
                user: req.user,
                charges: req.session.credit,
              });
        Credit.findOne({user: req.user}).sort({"_id": -1}).exec(function(err, data)   {
              if (!data) {
              var credit = new Credit({
              user: req.user,
              credit: parseFloat(Math.round((req.session.credit) * 100) / 100).toFixed(2)
              })
              } else {
              data.toObject({ getters: true })
              var credit = new Credit({
                  user: req.user,
                  credit: parseFloat(Math.round((req.session.credit-(-data.credit)) * 100) / 100).toFixed(2)
                  });
              }
             credit.save(function(err, result) {
                console.log(credit)
            })
       });
      transfer.save(function(err, result) {
          req.session.credit = false;
          req.flash('success', 'Ihr Konto wurde erfolgreich aufgeladen.');
          res.redirect('/');
      });
        }
    })
})

router.get('/checkout-user', function(req, res, next) {
    if(!req.session.credit) {
        return res.redirect('/');
    }
    var cart = parseFloat(Math.round(req.session.credit * 100) / 100).toFixed(2);
    var errMsg = req.flash('error')[0];
    if (errMsg) {
        console.log(errMsg)
    }
    res.render('user/checkout-user', {total: cart, errMsg: errMsg, noError: !errMsg, csrfToken: req.csrfToken()})
})

router.use('/', notLoggedIn, function(req, res, next) {
    next();
});

router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: 'back',
    failureFlash: true
}), function(req, res, next) {
    mailer.use('compile',hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: 'views/email',
            layoutsDir: 'views/email',
            defaultLayout: 'register.hbs',
          },
        viewPath: 'views/email',
        extName: '.hbs'
    }))
    if(req.session.oldUrl) {
       var oldUrl = req.session.oldUrl;
       req.session.oldUrl = null;
       res.redirect(oldUrl);
    } else {
        mailer.sendMail({
            from: 'service@brotritter.de',
            to: req.user.email,
            subject: "Erfolgreich registriert Brotritter",
            template: 'register',
            context: {},
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
            } else {
                req.flash("success", "Erfolgreich Registriert")
                res.redirect('back')
            }
            
        })
    }
});

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: 'back',
    failureFlash: true
}), function(req, res, next) {
    if(req.session.oldUrl) {
       var oldUrl = req.session.oldUrl;
       req.session.oldUrl = null;
       res.redirect(oldUrl);
    } else {
        req.flash("success", "Erfolgreich Eingeloggt")
        res.redirect('back')
    }
});

module.exports = router

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}  

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}       