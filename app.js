var session       =  require('express-session')
var express       =  require('express');
var path          =  require('path');
var favicon       =  require('serve-favicon');
var logger        =  require('morgan');
var cookieParser  =  require('cookie-parser');
var bodyParser    =  require('body-parser');
var User          =  require('./app/models/user');
var passport      =  require('passport');
var ejs           =  require('ejs');
var flash         =  require('express-flash');
var engine        =  require('ejs-mate');
var mongoose      =  require('mongoose');
var mongodb       =  require('mongodb');
var MongoStore    =  require('connect-mongo/es5')(session);

var indexRoutes   =  require('./app/controllers/index');
var usersRoutes   =  require('./app/controllers/users');
var sessionRoutes =  require('./app/controllers/session');

var app           =  express();

//connect to mongo database
var dbConfig      =  require('./config/db')
mongoose.connect(dbConfig.url);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
   resave:              true,
   saveUninitialized:   true,
   secret:              dbConfig.secret,
   store:               new MongoStore({ url: dbConfig.url, autoReconnect: true }) 
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

/*
   this middleware is used to make the user object accessible
   throughout the whole request / response cycle and it has to be
   defined after app.use(passport.session()) and before we start using
   our routes otherwise it won't work
*/
app.use(function(req, res, next){
  res.locals.user = req.user;
  next();
});


/* 
   now lets bring in our routes, doing so before 
   would cause our middle ware above to not work 
*/
app.use('/', indexRoutes);
/* app.use('/users', usersRoutes); */
app.use(usersRoutes);
app.use(sessionRoutes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err    =  new Error('Not Found');
  err.status =  404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
