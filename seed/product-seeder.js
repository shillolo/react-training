var mongoose = require('mongoose');
var Product = require('../models/product.js')

mongoose.connect('mongodb+srv://brotritter:brotritter@cluster0-odbbr.mongodb.net/shopping', { useNewUrlParser: true });

mongoose.Promise = global.Promise;

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var products = [,
    new Product({
    imagePath: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Gothiccover.png/220px-Gothiccover.png',
    title: 'Gothic',
    description: 'Never played honestly',
    price: 10
    }),
    new Product({
    imagePath: 'https://is5-ssl.mzstatic.com/image/thumb/Purple115/v4/f2/bd/69/f2bd6921-f059-0201-ae87-09209f704273/mzl.xuyicngs.png/246x0w.jpg',
    title: 'Minecraft',
    description: 'lot of blocks',
    price: 20
    }),
    new Product({
    imagePath: 'https://static.gamespot.com/uploads/scale_tiny/536/5360430/3080727-godofwar.jpg',
    title: 'God of War',
    description: 'Brutal',
    price: 30
    }),
    new Product({
    imagePath: 'https://images-na.ssl-images-amazon.com/images/I/715SJu-3bUL._SY445_.jpg',
    title: 'Dark Souls 3',
    description: 'Death',
    price: 25
    }),
    new Product({
    imagePath: 'https://images-na.ssl-images-amazon.com/images/I/81PWprQlMmL._SX355_.jpg',
    title: 'Zelda',
    description: 'Main Characters Name',
    price: 15
    }),
    new Product({
    imagePath: 'https://www.pokewiki.de/images/thumb/9/9a/Pok%C3%A9mon_Gold.jpg/315px-Pok%C3%A9mon_Gold.jpg',
    title: 'Pokemon Gold',
    description: 'Since Day 1',
    price: 50
    })
    
];

for (var i = 1; i < products.length; i++) {
   products[i].save(function(err, result) {
        if (err) return handleError(err);
})
}

console.log(products)
