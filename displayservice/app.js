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
const clientJuice = mqtt.connect(conf.mqttbroker);
const clientPuree = mqtt.connect(conf.mqttbroker);
const clientPieces = mqtt.connect(conf.mqttbroker);
const clientAlcohol = mqtt.connect(conf.mqttbroker);

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
  client.subscribe('workflow/start')
})

clientJuice.on('connect', () => {  
  console.log("connected to mqtt broker for juice msg at: "+conf.mqttbroker);
  clientJuice.subscribe('workflow/complete/user/juice')
})

clientPuree.on('connect', () => {  
  console.log("connected to mqtt broker for puree msg at: "+conf.mqttbroker);
  clientPuree.subscribe('workflow/complete/user/puree')
})

clientPieces.on('connect', () => {  
  console.log("connected to mqtt broker for pieces msg at: "+conf.mqttbroker);
  clientPieces.subscribe('workflow/complete/user/pieces')
})

clientAlcohol.on('connect', () => {  
  console.log("connected to mqtt broker for pieces msg at: "+conf.mqttbroker);
  clientAlcohol.subscribe('workflow/complete/user/alcohol')
})



//write task objects to db
client.on('message', (topic, message) => {  
    console.log("reveived a new message: "+message.toString());
	//expected message structure: (claimedtasks: [{"id":"657373", "workingstation":"65747", "productId":"27"}],{...},{...})
	var newMessage = JSON.parse(message);

console.log("found new message.... "+JSON.stringify(newMessage));
db.collection('displaydata').insert(newMessage);
console.log("wrote new order to db.... "+JSON.stringify(newMessage.productId));
});

clientJuice.on('message', (topic, message) => {  
  console.log("reveived a new done message from juice: "+message.toString());
  var message = JSON.parse(message);
  var query = { productId: message.productId };
  var newvalue = { $set: {juiceDone: true} };
  db.collection("displaydata").update(query, newvalue, function(err, res) {
    if (err) throw err;
    console.log("1 document updated, juiceDone for ID " + message.productId + " set to true" );
    db.close();
  });
});

clientPuree.on('message', (topic, message) => {  
  console.log("reveived a new done message from puree: "+message.toString());
  var message = JSON.parse(message);
  var query = { productId: message.productId };
  var newvalue = { $set: {pureeDone: true} };
  db.collection("displaydata").update(query, newvalue, function(err, res) {
    if (err) throw err;
    console.log("1 document updated, pureeDone for ID " + message.productId + " set to true");
    db.close();
  });
});

clientPieces.on('message', (topic, message) => {  
  console.log("reveived a new done message from pieces: "+message.toString());
  var message = JSON.parse(message);
  var query = { productId: message.productId };
  var newvalue = { $set: {piecesDone: true} };
  db.collection("displaydata").update(query, newvalue, function(err, res) {
    if (err) throw err;
    console.log("1 document updated, piecesDone for ID " + message.productId + " set to true");
    db.close();
  });
});

clientAlcohol.on('message', (topic, message) => {  
  console.log("reveived a new done message from pieces: "+message.toString());
  var message = JSON.parse(message);
  var query = { productId: message.productId };
  var newvalue = { $set: {alcoholDone: true} };
  db.collection("displaydata").update(query, newvalue, function(err, res) {
    if (err) throw err;
    console.log("1 document updated, alcoholDone for ID " + message.productId + " set to true");
    db.close();
  });
});

module.exports = app;
