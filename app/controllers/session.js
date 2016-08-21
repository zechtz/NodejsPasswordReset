var express        =  require('express');
var passport       =  require('passport');
var router         =  express.Router();
var passportConfig =  require('../../config/passport')

/* GET login page. */
router.get('/login', function(req, res) {
  if (req.user){
    req.flash('info', "You are already logged in");
    return res.redirect('/');
  } 
  res.render('sessions/new', { 
      title : 'Login'
  });
});

router.post('/session/create', function(req, res, next){
  passport.authenticate('local-login', function(err, user, info){
    if (err) return next(err);
    if (!user) return res.redirect('/login');
    req.login(user, function(err){
      if (err) return next(err)
        return res.redirect('/');
    });
  })(req, res, next)
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
  req.session.destroy();
});

module.exports = router;
