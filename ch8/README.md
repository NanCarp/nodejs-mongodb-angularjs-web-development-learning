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










