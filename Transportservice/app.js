var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/TransportDB');

const mqtt = require('mqtt')  
const client = mqtt.connect('mqtt:localhost')


var routes = require('./routes/index');
var tsdata = require('./routes/tsdata');

var app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


//log
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/tsdata', tsdata);

//Subscribe to Broker
client.on('connect', () => {  
  client.subscribe('workflow/claim/#')
})
//JSON in db speichern
client.on('message', (topic, message) => {  
    console.log(message.toString());
	var newMessage = JSON.parse(message);
	db.collection('tsdatalist').insert(newMessage);
});


// 404
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


//Error:
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
