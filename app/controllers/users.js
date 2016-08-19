var express =  require('express');
var router  =  express.Router();
var User    =  require('../models/user');

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

module.exports = router;
