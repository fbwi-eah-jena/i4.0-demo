var server = require('http').createServer(function (req, res){});
var conf = require('./config.json');
var io = require('socket.io').listen(server);

var SerialPort = require('serialport');
var port = new SerialPort(conf.comPort);

server();


function server()
{
	// Webserver
	// start on port X
	server.listen(conf.port);        

	// Websocket
	io.sockets.on('connection', function (socket) {
		console.log('new connection with client established...');
		
		scale(socket);
		socket.on('temp', function (data) {
			console.log('got message from client...');
	});
});

// debug some data on startup
console.log('The server is now running at http://127.0.0.1:' + conf.port + '/');
}


function scale(socket)
{ 
	port.on('readable', function () 
	{
		//2 bis 12 wird das gewicht angegeben
		//gezahelt wird von 0 aus
		var buf=port.read(20);
		var gewichtHex=new Buffer(10);
		
		if(buf!=null)
		{	
			buf.copy(gewichtHex,0,3,13);
			var msg=gewichtHex.toString('ascii').trim();
			console.log(gewichtHex.toString('ascii').trim());
			socket.emit('data', msg);
		}
		
	});
 
	// Open errors will be emitted as an error event
	port.on('error', function(err) {
		console.log('Error: ', err.message);
	});
}