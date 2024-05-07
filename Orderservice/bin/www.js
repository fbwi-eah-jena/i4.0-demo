#!/usr/bin/env node

/**
 * Module dependencies.
 */
var conf = require('../config.json');
var app = require('../app');
var debug = require('debug')('app-orderservice:server');
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3001');
app.set('port', port);
console.log("Running at localhost:", port)

/**
 * Create HTTP server.
 */


var ios = io.listen(server);//extent server with web sockets functionality

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

//Start MQTT Broker connection
const mqtt = require('mqtt'); 
console.log("connecting to mqttbroker at "+conf.mqttbroker);
const mqttClient = mqtt.connect(conf.mqttbroker);

/**
 * Normalize a port into a number, string, or false.
 */

//Websockets
ios.sockets.on('connection', function (socket) {
	//connected
	console.log('web socket connection with client established...');
    socket.on('order', function (data) {
 		console.log('order arrived...');

        mqttClient.publish("order/new",data);
	});
});

mqttClient.on('connect', () => {  
    console.log('connected to mqtt broker...');
    mqttClient.subscribe('order/accept/#')
})

mqttClient.on('message', (topic, message) => {  
    console.log("received message with topic: '"+topic+"' forwarding it to all clients");
    ios.sockets.emit(topic, message.toString());//send message to clients
    console.log("mqtt_message: "+message.toString());
})
//End MQTT Broker connection

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
