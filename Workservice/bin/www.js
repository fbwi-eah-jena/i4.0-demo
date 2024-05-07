/**
 * Module dependencies.
 */
var conf = require('../config.json');
var app = require('../app');
var debug = require('debug')('app-website:server');
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
//var ioClient = require('socket.io-client');

var usermanager = require('../classes/usermanager.js');
var toolmanager = require('../classes/toolmanager.js');
fs = require('fs');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);


console.log('Express server listening on port ' + app.get('port'));


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

//create user list
var usermanager = new usermanager.UserManager();

// Websocket functions
ios.sockets.on('connection', function (socket) {
	//connected
    console.log('web socket connection with client established...');
    var userName = app.userid;
    console.log('userName :'+userName);
    
    //register connection
    var client = usermanager.registerConnection(socket);
    socket.emit('userid', userName);//send username to client
    socket.emit('workingstation', conf.workingstation);//send workingstation name to client
    
    socket.on('register', function (userName) {
		// user to be assigned to the current connection
		console.log('client is registering its userName: '+userName);
        usermanager.assignUser(socket,userName);
        //send fresh tasklists
        mqttClient.publish("workflow/refresh/tasklist/user/"+userName,"");//post empty message
        mqttClient.publish("workflow/refresh/mytasklist/user/"+userName,"");//post empty message
        /*
        setInterval(function(){
            console.log("refreshing tasklist for user '"+userName+"'");
            mqttClient.publish("workflow/refresh/tasklist/user/"+userName,"");//post empty message
        }, 60000);//refresh after every 60 secs.
        */
	});
    socket.on('claim', function (data) {
		// user is claiming a list of tasks
        
		console.log('client for '+client.user.userName+' is claiming list of tasks... forwarding message to event broker');
        mqttClient.publish("workflow/claim/user/"+client.user.userName,data);
        //refresh List
        mqttClient.publish("workflow/refresh/tasklist/user/"+userName,"");//post empty message
        mqttClient.publish("workflow/refresh/mytasklist/user/"+userName,"");//post empty message
	});
    socket.on('do', function (data) {
		// user is doing a list of tasks
		console.log('client for '+client.user.userName+' is doing list of tasks... forwarding message to event broker');
        client.user.setCurrentWorkTask(data);
        toolmanager.resetAll();
        mqttClient.publish("workflow/do/user/"+client.user.userName,data);
	});
    socket.on('complete', function (data) {
		// user is has completed a task
		console.log('client for '+client.user.userName+' has completed a task... forwarding message to event broker');
        client.user.setCurrentWorkTask(null);
        mqttClient.publish("workflow/complete/user/"+client.user.userName,data);
        //create JSON string for task completion
        let completionData = "{'taskdata':"+data+", 'sensordata':"+JSON.stringify(toolmanager.getSummary())+"}";
        console.log("completion data: "+completionData);            
        mqttClient.publish("tools/complete/user/"+client.user.userName,completionData);
        //refresh
        mqttClient.publish("workflow/refresh/tasklist/user/"+userName,"");//post empty message
        mqttClient.publish("workflow/refresh/mytasklist/user/"+userName,"");//post empty message
	});
    socket.on('disconnect', function () {
        console.log('client is disconnected...');
        usermanager.unregisterConnection(socket);
  });    
});


function refreshTaskListLoopForClient(client)
{
   if(client!=null)
   {
       console.log("refreshing tasklist for username: "+client.user.userName);
       mqttClient.publish("workflow/refresh/tasklist/user/"+client.user.userName,"");//post empty message
   }
}

//external tool connection
var toolmanager = new toolmanager.ToolManager();

//connectToExternalTools();

function connectToExternalTools()
{
    console.log("try connection to external tools...");
    for(toolConfig of conf.tools)
    {
        console.log("connecting to external tool '"+toolConfig.name+"' at "+toolConfig.url);
        let tool = toolmanager.addTool(toolConfig.name,toolConfig.url);
        let toolSocket = ioClient.connect(tool.url);

        toolSocket.on('connect', function () { 
            console.log("connected to external tool '"+tool.name+"' at '"+tool.url+"'"); 
        });
        toolSocket.on('data', function (data) { 
            //console.log("receiving new data from external tool '"+tool1.name+"': '"+data+"'");
            tool.addValue("Gewicht in g",data);
            ios.sockets.emit('toolData', JSON.stringify(tool.getToolSummary()));//forward message to clients
            //console.log("current tools summary:");
            //console.log(JSON.stringify(tool.getToolSummary()));
        });

    }
}


mqttClient.on('connect', () => {  
    console.log("connection to mqtt broker established");
    var rootTopic = "workflow/#";
    console.log("subscribing to topic '"+rootTopic+"'");
    mqttClient.subscribe(rootTopic)
})

mqttClient.on('message', (topic, message) => {  
    console.log("received message with topic: '"+topic+"' forwarding it to all clients");
    ios.sockets.emit(topic, message.toString());//send message to clients
    console.log("mqtt_message: "+message.toString());
})
//End MQTT Broker connection


/**
 * Normalize a port into a number, string, or false.
 */

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
