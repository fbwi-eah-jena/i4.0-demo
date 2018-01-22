var express = require('express');
var conf = require('./config.json');
var mqtt = require('mqtt');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');


const client = mqtt.connect(conf.mqttbroker);

var mongo = require('mongodb');
var monk = require('monk');
var db = monk(conf.db);
console.log("connected to mongo_db at: "+conf.db);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

client.on('connect', () => {  
  console.log("connected to mqtt broker at: "+conf.mqttbroker);
  client.subscribe('workflow/#')
})
//write task objects to db
client.on('message', (topic, message) => {  
    console.log("reveived a new message: "+message.toString());
	//expected message structure: (claimedtasks: [{"id":"657373", "workingstation":"65747", "productId":"27"}],{...},{...})
	var newMessage = JSON.parse(message);

console.log("found new message.... "+JSON.stringify(newMessage));
db.collection('displaydata').insert(newMessage);
console.log("wrote order to db.... "+JSON.stringify(newMessage.productId));
});

module.exports = app;
