var 
	server = require('http').createServer(function (req, res){}),
	HID = require('node-hid'),
	io = require('socket.io').listen(server),
	conf = require('./config.json');
	
	
	var vid=2338,
	msg='waiting for scale',
	bufferMsg=0;
	pid=32771;

// Webserver
// start on port X
server.listen(conf.port);        

// Websocket
io.sockets.on('connection', function (socket) {
	// client is connected
	console.log('new connection with client established...');
	scale(socket);
	/*setInterval(function(){
            socket.emit('data', msg);
        }, 100);//refresh after every x millisecs.*/
	
	// if someone sends something
	socket.on('temp', function (data) {
		console.log('got message from client...');
	});
});

// debug some data on startup
console.log('The server is now running at http://127.0.0.1:' + conf.port + '/');


function scale(socket)
{
	var scale = new HID.HID(vid, pid);

	scale.on('data', function (data) {
            var buf = new Buffer(data);
			  
            var grams = buf[4] + (256 * buf[5]);
            if (buf[1] === 5) {
				msg='TARE IS ON';
			} 
			else if (grams > 0 && buf[3] === 255) { // in ounce
				msg='Please switch to gram';
			} 
			else{
				msg=grams;
            }
			console.log(msg);
			socket.emit('data', msg);
		//bufferMsg=msg;
    });
	
	scale.on('error', function (err){
			console.log("ERROR");
            if (!/could not read from HID device/.test(err.message)) {
                console.log(err);
            }
			msg=err;
			msg+=" Please Restart Server and check connection between Scale and PC";
            d.close();
    });
	
	//if(bufferMsg!=msg)
	//{	
		socket.emit('data', msg);
		bufferMsg=msg;
	//}
}