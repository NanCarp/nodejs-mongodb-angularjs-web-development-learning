var net = require('net');
var client = net.connect({port: 8107, host:'localhost'}, function() {
	console.log('Client connected');
	client.write('Some data\r\n');
});
client.on('data', function(data) {
	console.log(data.toString());
	client.end();
});
client.on('end', function() {
	console.log('Client disconnected');
});

var net = require('net');
var server = net.createServer(function(client) {
	console.log('Client connected');
	client.on('data', function(data) {
		console.log('Client sent ' + data.toString());
	});
	client.on('end', function() {
		console.log('Client disconnected');
	});
	client.write('Hello');
});
server.listen(8107, function() {
	console.log('Server listening for connections');
});

function writeData(socket, data) {
	var success = !socket.write(data);
	if (!success) {
		(function(socket, data){
			socket.once('drain', function() {
				writeData(socket, data);
			});
		})(socket, data);
	}
}















