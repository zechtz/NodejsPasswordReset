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

UserSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword =  function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
