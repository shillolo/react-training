var mongoose = require("mongoose");
var Bakery = require("../models/bakerys.js");

mongoose.connect(
  "mongodb+srv://brotritter:brotritter@cluster0-odbbr.mongodb.net/shopping",
  { useNewUrlParser: true }
);

mongoose.Promise = global.Promise;

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var bakerys = [
  ,
  new Bakery({
    imagePath: "../images/cropped-Bäckermeister-Haferkamp-3-gestaucht.jpg",
    title: "Bäckermeister Haferkamp",
    address: "H-H-Meier Alee 33",
    closed: false,
    storelink: "http://localhost:3000/bakery",
    buns: [
      {
        imagePath: "../images/weltmeister.jpg",
        title: "Weltmeister",
        price: 0.67,
        ofprice: "0,67",
        ingredients: ["Weizenmehl", "Wasser", "Salz"],
        expdate: "",
        clicked: false
      },
      {
        imagePath: "../images/weltmeister.jpg",
        title: "Croissant",
        price: 0.82,
        ofprice: "0,82",
        ingredients: ["Weizenmehl", "Wasser", "Salz"],
        expdate: "",
        clicked: false
      },
      {
        imagePath: "../images/weltmeister.jpg",
        title: "Normales",
        price: 0.32,
        ofprice: "0,32",
        ingredients: ["Weizenmehl", "Wasser", "Salz"],
        expdate: "",
        clicked: false
      },
      {
        imagePath: "../images/weltmeister.jpg",
        title: "Weltmeister",
        price: 0.67,
        ofprice: "0,67",
        ingredients: ["Weizenmehl", "Wasser", "Salz"],
        expdate: "",
        clicked: false
      },
      {
        imagePath: "../images/weltmeister.jpg",
        title: "Normales",
        price: 0.32,
        ofprice: "0,32",
        ingredients: ["Weizenmehl", "Wasser", "Salz"],
        expdate: "",
        clicked: false
      }
    ]
  }),
  new Bakery({
    coordinates: 33,
    imagePath: "../images/cropped-Bäckermeister-Haferkamp-3-gestaucht.jpg",
    title: "Bäckermeister Haferkamp",
    address: "Krogstraße 33",
    closed: false,
    storelink: "http://localhost:3000/bakery",
    buns: [
      {
        imagePath: "../images/weltmeister.jpg",
        title: "Weltmeister",
        price: 0.67,
        ofprice: "0,67",
        ingredients: ["Weizenmehl", "Wasser", "Salz"],
        expdate: "",
        clicked: false
      },
      {
        imagePath: "../images/weltmeister.jpg",
        title: "Croissant",
        price: 0.82,
        ofprice: "0,82",
        ingredients: ["Weizenmehl", "Wasser", "Salz"],
        expdate: "",
        clicked: false
      },
      {
        imagePath: "../images/weltmeister.jpg",
        title: "Normales",
        price: 0.32,
        ofprice: "0,32",
        ingredients: ["Weizenmehl", "Wasser", "Salz"],
        expdate: "",
        clicked: false
      },
      {
        imagePath: "../images/weltmeister.jpg",
        title: "Weltmeister",
        price: 0.67,
        ofprice: "0,67",
        ingredients: ["Weizenmehl", "Wasser", "Salz"],
        expdate: "",
        clicked: false
      },
      {
        imagePath: "../images/weltmeister.jpg",
        title: "Normales",
        price: 0.32,
        ofprice: "0,32",
        ingredients: ["Weizenmehl", "Wasser", "Salz"],
        expdate: "",
        clicked: false
      }
    ]
  })
];

for (var i = 1; i < bakerys.length; i++) {
  bakerys[i].save(function(err, result) {
    if (err) return handleError(err);
  });
}

console.log(bakerys);
