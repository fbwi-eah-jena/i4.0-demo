var conf = require('./config.json');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk(conf.db);
console.log("connected to mongo_db at: "+conf.db);

const mqtt = require('mqtt');  
const client = mqtt.connect(conf.mqttbroker);

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

//Subscribe to Broker
client.on('connect', () => {  
  console.log("connected to mqtt broker at: "+conf.mqttbroker);
  client.subscribe('workflow/claim/#')
})
//write task objects to db
client.on('message', (topic, message) => {  
    console.log("reveived a new message: "+message.toString());
	//expected message structure: (claimedtasks: [{"id":"657373", "workingstation":"65747", "productId":"27"}],{...},{...})
	var newMessage = JSON.parse(message);
	for(thisTask of newMessage.claimedtasks)
	{
		console.log("found new claimed task.... "+JSON.stringify(thisTask));
		db.collection('tsdatalist').insert(thisTask);
	}
});


module.exports = app;
