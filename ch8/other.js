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

var server = net.createServer(function (client)) {
	// 这里实现连接的回调处理程序代码
});
server.listen(8107, function () {
	// 这里实现监听回调处理
});

server.on('close', function () {
	console.log('Server Terminated');
});
server.on('error', function (err) {
	
});

this.setTimeout(500);
this.setEncoding('utf8');

this.on('data', function (data) {
	console.log("Received from client: " + data.toString());
	// 处理数据
});

function writeData(socket, data) {
	var success = !socket.write(data);
	if (!success) {
		(function (socket, data) {
			socket.once('drain', function () {
				writeData(socket, data);
			});
		})(socket, data);
	}
}

 









