var mongoose   = require('mongoose');
var bcrypt     = require('bcrypt-nodejs');
var crypto     = require('crypto');
var Schema     = mongoose.Schema;

var UserSchema =  new Schema({
  username             : { type  : String, required : true, unique : true },
  email                : { type  : String, required : true, unique : true },
  password             : { type  : String, required : true },
  resetPasswordToken   : String,
  resetPasswordExpires : Date
});

module.exports = mongoose.model('User', UserSchema);
