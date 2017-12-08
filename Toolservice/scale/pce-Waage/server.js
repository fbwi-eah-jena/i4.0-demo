var server = require('http').createServer(function (req, res){});
var conf = require('./config.json');
var io = require('socket.io').listen(server);

var sp = require('serialport');
var port = new sp(conf.comPort, {parser: new sp.parsers.Readline('\r\n')});


//connectToServer();
scale();

function connectToServer()
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

var buf='';
var line='';
var gewicht=0;

function scale()
{ 
	port.on('data', function (data) 
	{
		buf+=data;
		if(buf.indexOf('\r\n')!=-1)
		{	
			line=buf.split('\r\n')[0];
			gewicht=line.substring(4,13).trim();
	
			if(line.length==18)
			{
				console.log(gewicht);
			}

			buf='';
			
		}
		
	});
 
	// Open errors will be emitted as an error event
	port.on('error', function(err) {
		console.log('Error: ', err.message);
	});
}

