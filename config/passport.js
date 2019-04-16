var passport = require('passport');
var User = require('../models/breaduser');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    var password2 = req.body.password2;
    req.checkBody('email', 'Invalid email').notEmpty().isEmail(); req.checkBody('password', 'Ihr Passwort braucht mindestens 5 Zeichen').notEmpty().isLength({min:5});
    req.checkBody('password2', 'Die Passwörter stimmen nicht überein').equals(req.body.password);
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, {message: 'Diese Email Adresse wird schon benutzt'})
        }
        var random = Math.floor(Math.random()*90000) + 10000;
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.knumber = random;
        newUser.save(function(err, result) {
            if (err) {
                return done(err);
            }
            return done(null, newUser);
        });
    })
})
)

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
        req.checkBody('email', 'Invalid email').notEmpty().isEmail(); req.checkBody('password', 'Falsches Passwort').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: 'Diesen Benutzer gibt es nicht'})
        }
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Falsches Passwort'})
        }
        return done(null, user)
    })
}));