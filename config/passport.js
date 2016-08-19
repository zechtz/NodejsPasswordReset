var passport      =  require('passport');
var LocalStrategy =  require('passport-local').Strategy;
var User          =  require('../app/models/user');

/* serialize and de-serialize  */
passport.serializeUser(function(user, done){
  done(null, user._id);
});

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});

/* middleware  */
passport.use('local-login', new LocalStrategy({
      usernameField     : 'username',
      passwordField     : 'password',
      passReqToCallback : true
}, function(req, username, password, done){
  User.findOne({username: username}, function(err, user){
    /* 
       there's an error trying to look for user 
       maybe database connection or something else 
       */
    if (err) return done(err);

    /* 
       we are able to access the database but the 
       user we're looking for is not in our database 
       */
    if (!user) {
        return done(null, false, req.flash('loginMessage', ' No user has been found'));
    }

    /* 
       we found the user who wants to acces our system 
       but for some reason, password provide is wrong 
       */
    if (!user.comparePassword) {
      return done(null, false, req.flash('loginMessage', ' Oops! wrong password'));
    }

    /* 
       all is well, we found the user and all the information 
       provided is correct 
       */
    return done(null, user);
  });
}));

exports.isAuthenticated = function(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
};
