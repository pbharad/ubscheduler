//const db = require('./config/config');

let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cors = require('cors');

let indexRouter = require('./routes/index');
let loginController = require('./controller/Login');
let signupController = require('./controller/Signup');
//let usersRouter = require('./routes/users');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//app.use('/users', usersRouter);

//enable cors
/*app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS,PATCH,DELETE');
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    else {
        next();
    }

});*/
app.use(cors());

app.use('/api/login', loginController);

app.use('/api/signup',signupController);



// Authenticate the request
app.use(function(req, res, next){
    let validated = true; // call the validation function
    if(validated){
        next();
    }else{
        res.send({status:false, data:"Authentication failed"});
    }
});

// All the routes will be handled in index.js.
app.use('/api', indexRouter);

// Serving static web page
app.use('/',express.static('../Client/dist'));

// routes
//let routesData = require('./routes');
//routesData.routes(app);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
