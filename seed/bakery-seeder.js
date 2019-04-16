var mongoose = require('mongoose');
var Bakery = require('../models/bakerys.js')

mongoose.connect('mongodb+srv://brotritter:brotritter@cluster0-odbbr.mongodb.net/shopping', { useNewUrlParser: true });

mongoose.Promise = global.Promise;

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var bakerys = [,
    new Bakery({
    imagePath: '../images/cropped-Bäckermeister-Haferkamp-3-gestaucht.jpg',
    title: 'Bäckermeister Haferkamp',
    buns: [{
            imagePath: '../images/weltmeister.jpg',
            title: "Weltmeister",
            price: 0.32
            },
            {
            imagePath: '../images/weltmeister.jpg',
            title: "Normales",
            price: 0.52
            },
            {
            imagePath: '../images/weltmeister.jpg',
            title: "Croissant",
            price: 0.82
          }],
    address: "Ulru"
    }),
    new Bakery({
    imagePath: '../images/cropped-Bäckermeister-Haferkamp-3-gestaucht.jpg',
    title: 'Bäckermeister Schäfers',
    buns: [{
            imagePath: '../images/weltmeister.jpg',
            title: "Weltmeister",
            price: 0.32
            },
            {
            imagePath: '../images/weltmeister.jpg',
            title: "Normales",
            price: 0.52
            },
            {
            imagePath: '../images/weltmeister.jpg',
            title: "Croissant",
            price: 0.82
          }],
    address: "Ulru"
    }),
    new Bakery({
    imagePath: '../images/cropped-Bäckermeister-Haferkamp-3-gestaucht.jpg',
    title: 'Bäckermeister Otten',
    buns: [{
            imagePath: '../images/weltmeister.jpg',
            title: "Weltmeister",
            price: 0.32
            },
            {
            imagePath: '../images/weltmeister.jpg',
            title: "Normales",
            price: 0.52
            },
            {
            imagePath: '../images/weltmeister.jpg',
            title: "Croissant",
            price: 0.82
          }],
    address: "Ulru"
    }),
];

for (var i = 1; i < bakerys.length; i++) {
   bakerys[i].save(function(err, result) {
        if (err) return handleError(err);
})
}

console.log(bakerys)