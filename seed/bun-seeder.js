 var mongoose = require('mongoose');
var Bun = require('../models/buns.js')

mongoose.connect('mongodb+srv://brotritter:brotritter@cluster0-odbbr.mongodb.net/shopping', { useNewUrlParser: true });

mongoose.Promise = global.Promise;

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var buns = [,
    new Bun({
    imagePath: '../images/weltmeister.jpg',
    title: 'Weltmeister',
    price: 0.67,
    ofprice: "0,67",
    ingredients: ["Weizenmehl", "Wasser", "Salz"],
    expdate: "",
    clicked: false
    }),
    new Bun({
    imagePath: '../images/weltmeister.jpg',
    title: 'Croissant',
    price: 0.82,
    ofprice: "0,82",
    ingredients: ["Weizenmehl", "Wasser", "Salz"],
    expdate: "",
    clicked: false
    }),
    new Bun({
    imagePath: '../images/weltmeister.jpg',
    title: 'Normales',
    price: 0.32,
    ofprice: "0,32",
    ingredients: ["Weizenmehl", "Wasser", "Salz"],
    expdate: "",
    clicked: false
    }),
    new Bun({
    imagePath: '../images/weltmeister.jpg',
    title: 'Weltmeister',
    price: 0.67,
    ofprice: "0,67",
    ingredients: ["Weizenmehl", "Wasser", "Salz"],
    expdate: "",
    clicked: false
    }),
    new Bun({
    imagePath: '../images/weltmeister.jpg',
    title: 'Normales',
    price: 0.32,
    ofprice: "0,32",
    ingredients: ["Weizenmehl", "Wasser", "Salz"],
    expdate: "",
    clicked: false
}),
];

for (var i = 1; i < buns.length; i++) {
   buns[i].save(function(err, result) {
        if (err) return handleError(err);
})
}

console.log(buns)