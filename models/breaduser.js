var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
    email: {type: String, unique: true, sparse: true},
    password: {type: String, unique: true, sparse: true},
    resetPasswordToken: {type: String, unique: true, sparse: true},
    resetPasswordExpires: {type: Date, unique: true, sparse: true},
    knumber: {type: String, unique: true, sparse: true} 
});

userSchema.methods.encryptPassword = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null)  
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
};

module.exports = mongoose.model('Breaduser', userSchema);