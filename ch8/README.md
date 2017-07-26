---
title: 在 Node.js 中实现套接字服务
date: 2017-07-21 22:09:18
tags: Node.js MongoDB AngularJS Web 学习
---

## 8.2 了解 TCP 服务器和 Socket 对象  
### 8.2.1 net.Socket 对象  
Socket 对象同时在套接字服务器和客户端套接字上创建，并允许数据在它们之间来回写入和读取。Socket 对象实现 Duplex 
流，所以它提供了 Writable 和 Readable 数据流提供的所有功能。  
在套接字客户端，当调用 net.connect() 或 net.createConnection() 时，Socket 对象在内部创建。这个对象是为了表示
到服务器的套接字连接。使用 Socket 对象来监控该连接，将数据发送到服务器并处理来自服务器的响应。在 Node.js net 
模块中没有明确的客户端对象，因为 Socket 对象充当完整的客户端，能够发送/接收数据并终止连接。  
在套接字服务器上，当客户端连接到服务器时，Socket 对象被创建，并被传递到连接事件处理程序。这个对象是为了表示对
客户端的套接字连接。在服务器上，使用 Socket 对象来监控客户端连接，并对客户端发送和接收数据。  
下面代码显示了实现客户端上的 Socket 对象的基本知识：  
```
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
```
注意,net.connect() 方法使用含有 port 和 host 属性的可选对象被调用。connect 回调函数记录一条消息，然后写一些
数据到服务器。要处理从服务器返回的数据，就要实现 on('data') 事件处理程序。要处理套接字的关闭，就要实现 on('end') 
事件处理程序。  

### 8.2.2 net.Server 对象  
下面代码实现 Server 对象：  
```
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
```
net.createServer() 方法实现了一个接受客户端 Socket 对象的回调函数。要处理从客户端回来的数据时，就要实现 
on('data') 事件处理程序。为了处理套接字的关闭，就需要实现 on('end') 事件处理程序。要开始监听连接，就在端口 
8107 上调用 listen() 方法。  

## 8.3 实现 TCP 套接字服务器和客户端  
### 8.3.1 实现 TCP 套接字客户端  
第一步，调用 net.connect() 创建套接字客户端，传入端口和主机，实现回调函数来处理连接事件：  
```
net.connect({port: 8107, host:'localhost'}, function () {
    // 处理连接
});
```
然后在回调函数里建立连接的行为。例如，可能要添加超时时间或设置编码，如下：  
```
this.on('data', function(data) {
    console.log("Read from server: " + data.toString());
    // 处理数据
    this.end();
});
```
要把数据写到服务器，要实现 write() 命令。如果你正在写很多数据写到服务器，并且写入失败，可能还需要实现一个 
drain 事件处理程序，以在缓冲区为空时重新开始写入。以下显示的例子实现了处理写入失败的 drain 处理程序。请注意，
一旦函数结束，就用一个闭包来保存套接字和数据变量的值：  
```
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
```
以下显示了一个基本的 TCP 套接字客户端的完整实现。注意，有 3 个单独的套接字打开到服务器，而它们在同一时间进行
通信。被创建的每个客户端都获得不同的随机端口号。  
```
var net = require('net');
function getConnection(connName) {
	var client = net.connect({port: 8017, host:'localhost'}, function() {
		console.log(connName + ' Connected: ');
		console.log('	local = %s:%s', this.localAddress, this.localPort);
		console.log('	remote = %s:%s', this.remoteAdress, this.remotePort);
		this.setTimeout(500);
		this.setEncoding('utf8');
		this.on('data', function(data) {
			console.log(connName + " From Server: " + data.toString());
			this.end();
		});
		this.on('end', function() {
			console.log(connName + ' Client disconnected');
		});
		this.on('error', function(err) {
			console.log('Socket Error: ', JSON.stringify(err));
		});
		this.on('timeout', function() {
			console.log('Socket Time Out');
		});
		this.on('close', function() {
			console.log('Socket Closed');
		});
	});
	return client;
}
function writeData(socket, data) {
	var success = !socket.write(data);
	if (!success) {
		(function(socket, data) {
			socket.once('drain', function() {
				writeData(socket, data);
			});
		})(socket, data);
	}
}
var Dwarves = getConnection("Dwarves");
var Elves = getConnection("Elves");
var Hobbits = getConnection("Hobbits");
writeData(Dwarves, "More Axes");
writeData(Elves, "More Arrows");
writeData(Hobbits, "More Pipe Weed");
```

### 8.3.2 实现 TCP 套接字服务器  
第一步，调用 net.createServer() 创建套接字服务器，同时提供连接回调处理程序，调用 listen() 开始在该端口上监听：  
```
var server = net.createServer(function (client)) {
	// 这里实现连接的回调处理程序代码
});
server.listen(8107, function () {
	// 这里实现监听回调处理
});
```
在 listen 回调处理程序内，可以添加处理程序来支持 Server 对象上的 close 和 error 事件。  
```
server.on('close', function () {
	console.log('Server Terminated');
});
server.on('error', function (err) {
	
});
```
然后在 connection 事件回调函数里建立连接的行为。例如，添加超时时间或设置编码：  
```
this.setTimeout(500);
this.setEncoding('utf8');
```
还需要添加处理程序来处理客户端连接上的 data、end、error、timeout 和 close 事件。例如，为了处理 data 事件，
以使你可以读取来自客户端的数据，就可以在建立连接后，添加一下处理程序：  
```
this.on('data', function (data) {
	console.log("Received from client: " + data.toString());
	// 处理数据
});
```
要把数据写到服务器，就需要在代码的某个地方实现 write() 命令。如果正在写很多数据到客户端，则可能还需要实现
一个 drain 事件处理程序，以在缓冲区为空时重新开始写入。如果因为缓冲区已满而使 write() 返回一个失败，或者想
切断写入套接字，这会有帮助。以下实现了处理写入失败的 drain 处理程序。请注意，一旦函数结束，就用一个闭包来保存
套接字和数据变量的值：  
```
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
```
下面实现了一个基本 TCP 套接字服务器的完整实现。此套接字服务器在端口 8107 上接受连接，读取数据，然后把写入的
字符串返回给客户端。
```
var net = require('net');
var server = net.createServer(function (client) {
	console.log('Client connection: ');
	console.log('	local = %s:%s', client.localAddress, client.localPort);
	console.log('	remote = %s:%s', client.remoteAdress, client.remotePort);
	client.setTimeout(500);
	client.setEncoding('utf8');
	client.on('data', function (data) {
		console.log('Received data from client on port %d: %s', 
					client.remotePort, data.toString());
		console.log(' Bytes received: ' + client.bytesRead);
		writeData(client, 'Sending: ' + data.toString());
		console.log(' Bytes sent: ' + client.bytesWritten);
	});
	client.on('end', function () {
		console.log('Client disconnected');
		server.getConnections(function (err, count) {
			console.log('Remaining Connections: ' + count);
		});
	});
	client.on('timeout', function () {
		console.log('Socket Timed out');
	});
});

server.listen(8017, function () {
	console.log('Server listening: ' + JSON.stringify(server.address()));
	server.on('close', function () {
		console.log('Server Terminated');
	});
	server.on('error', function (err) {
		console.log('Server Error: ', JSON.stringify(err));
	});
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
```
先运行 socket_server.js，另开一个终端在运行 socket_client.js，输出：  
server 端：  
```
$ node socket_server.js
Server listening: {"address":"::","family":"IPv6","port":8017}
Client connection:
        local = ::ffff:127.0.0.1:8017
        remote = undefined:49598
Client connection:
        local = ::ffff:127.0.0.1:8017
        remote = undefined:49599
Client connection:
        local = ::ffff:127.0.0.1:8017
        remote = undefined:49600
Received data from client on port 49598: More Arrows
 Bytes received: 11
 Bytes sent: 20
Received data from client on port 49599: More Pipe Weed
 Bytes received: 14
 Bytes sent: 23
Received data from client on port 49600: More Axes
 Bytes received: 9
 Bytes sent: 18
Client disconnected
Remaining Connections: 2
Client disconnected
Remaining Connections: 1
Client disconnected
Remaining Connections: 0
```
client 端：  
```
$ node socket_client.js
Elves Connected:
        local = 127.0.0.1:49598
        remote = undefined:8017
Hobbits Connected:
        local = 127.0.0.1:49599
        remote = undefined:8017
Dwarves Connected:
        local = 127.0.0.1:49600
        remote = undefined:8017
Elves From Server: Sending: More Arrows
Hobbits From Server: Sending: More Pipe Weed
Dwarves From Server: Sending: More Axes
Elves Client disconnected
Socket Closed
Hobbits Client disconnected
Socket Closed
Dwarves Client disconnected
Socket Closed
```













