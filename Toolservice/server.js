var server = require('http').createServer(function (req, res){})
,   io = require('socket.io').listen(server)
,   conf = require('./config.json');

// Webserver
// start on port X
server.listen(conf.port);

// Websocket
io.sockets.on('connection', function (socket) {
	// client is connected
	console.log('new connection with client established...');
	setInterval(function(){
            socket.emit('data', new Date().getMilliseconds());// just some dummy data
        }, 100);//refresh after every x millisecs.
	
	// if someone sends something
	socket.on('temp', function (data) {
		console.log('got message from client...');
	});
});

// debug some data on startup
console.log('The server is now running at http://127.0.0.1:' + conf.port + '/');