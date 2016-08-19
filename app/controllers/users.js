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

router.get('/forgot', function(req, res){
  res.render('users/forgot-password', {
      title : 'Forgot Password'
  });
});

router.post('/users/forgot-password', function(req, res, next){
  async.waterfall([
      function(done){
        crypto.randomBytes(20, function(err, buf){
          var token = buf.toString('hex');
          done(err, token);
        });
      }, 
      function(token, done){
        User.findOne({email: req.body.email}, function(err, user){
          if (!user){
            req.flash('error', 'No account with that email exists');
            return res.redirect('/forgot');
          }
          user.resetPasswordToken   =  token;
          user.resetPasswordExpires =  Date.now() + 3600000 // one hour

          user.save(function(err){
            done(err, token, user);
          });
        });
      },
      function(token, user, done){

        var smtpTransport = nodemailer.createTransport(smtpTransport, {
            host : "localhost",
            secureConnection : false,
            port: 587,
            service    : 'SendGrid',
            auth : {
              user     : secretConfig.username,
              password : secretConfig.password 
            }
        });

        var mailOptions = {
          to      : user.email,
          from    : 'yourdaddy@dadayake.com',
          subject : 'Password Reset',
          text    : 'You have asked to rest your password, Please click on the following\n\n'+
            'link or paste it into your browser to complete the process\n\n ' +
            'http://' + req.header.host + '/reset-password/' + token + '\n\n' +
            'if you did not request this, please ignore this email and your password will stay unchanged\n\n'+
            'Please note that this link is valid for the next one hour\n\n'+
            'Thanks'
        };
        smtpTransport.sendMail(mailOptions, function(err){
          req.flash('info', 'An email has been sent to '+ user.email + ' with further instructions');
          done(err, 'done');
        });
      }
  ],function(err){
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

module.exports = router;
