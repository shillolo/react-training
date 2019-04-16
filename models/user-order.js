var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb+srv://brotritter:brotritter@cluster0-odbbr.mongodb.net/shopping', { useNewUrlParser: true });

mongoose.Promise = global.Promise;

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var schema = new Schema({
    user: Schema.Types.ObjectId,
    cart: Array,
    amount: Array,
    total: Number,
    date: String,
    time: String,
    parsedDate: String,
    today: Date,
    code: Number
});

module.exports = mongoose.model('User_Order', schema);