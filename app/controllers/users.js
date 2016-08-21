var express       =  require('express');
var router        =  express.Router();
var User          =  require('../models/user');
var async         =  require('async');
var crypto        =  require('crypto');
var nodemailer    =  require('nodemailer');
var smtpTransport =  require('nodemailer-smtp-transport');
var secretConfig  =  require('../../config/secrets');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/signup', function(req, res){
  res.render('users/new', {
      title : 'Sign Up'
  });
});

router.post('/users/create', function(req, res, next){
  var user      =  new User()
  user.username =  req.body.username;
  user.email    =  req.body.email;
  user.password =  req.body.password;

  user.save(function(err){
    if (err) return next(err);
    req.logIn(user, function(err){
      if (err) return next(err);
      res.redirect('/');
    });
  })
});

router.get('/forgot-password', function(req, res){
  if (req.user){
    req.flash('info', "You are already logged in");
    return res.redirect('/');
  }
  res.render('users/forgot-password', {
      title : 'Forgot Password'
  });
});


router.post('/users/forgot-password', function(req, res, next) {
  async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', "Account with that email doesn't exists.");
            return res.redirect('/users/forgot-password');
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: secretConfig.Gmail.username,
              pass: secretConfig.Gmail.password 
            }
        });
        var mailOptions = {
          to:       user.email,
          from:     'yourdaddy@gmail.com',
          subject:  'Password Reset',
          text:     'You are receiving this because you have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/users/reset-password/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

router.get('/users/reset-password/:token', function(req, res){
  User.findOne({
      resetPasswordToken: req.params.token, 
      resetPasswordExpires: {$gt: Date.now()}}, 
    function(err, user){
    if (!user) {
      req.flash('error', 'Password reset token is either invalid or has expired')
      return res.redirect('/forgot-password');
    }
    res.render('users/reset-password', {
        title : 'Rest Password',
        user  : user
    })
  });
});

router.post('/users/reset-password/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ 
          resetPasswordToken: req.params.token, 
          resetPasswordExpires: { $gt: Date.now() } }, 
        function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.password             =  req.body.password;
        user.resetPasswordToken   =  undefined;
        user.resetPasswordExpires =  undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
          service: 'SendGrid', // change to SendGrid if you're using sendgrid 
          auth: {
            user: secretConfig.SendGrid.username, // user secretConfig.SendGrid.username if you're using sendgrid
            pass: secretConfig.SendGrid.password  // use secretConfig.SendGrid.password if you're using sendgrind 
          }
      });
      var mailOptions = {
        to      : user.email,
        from    : 'yourdaddy@gmail.com',
        subject : 'Password Changed',
        text    : 'Hello,\n\n' +
          'The password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

module.exports = router;
