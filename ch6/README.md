---
title: 从 Node.js 访问文件系统
date: 2017-07-05 22:56:40
tags: Node.js MongoDB AngularJS Web 学习
---

## 6.1 同步和异步文件调用  
重要区别：  
- 异步调用需要一个回调函数作为额外的参数。回调函数在系统的请求完成时被执行，并且通常包含一个错误作为其第一个参数。
- 异步调用自动处理异常；且如果发生异常，就把错误对象作为第一个参数传递。同步调用中处理异常，必须使用 try/catch 快。
- 同步调用立即运行，除非完成，否则不会返回到当前线程。异步调用被放置在事件队列中，并且执行返回到正在运行的线程的
代码，但是实际的调用知道它被事件循环提取出时才会执行。

## 6.2 打开和关闭文件  
一旦文件被打开，就可以从中读取数据或写入数据，这取决于用来打开文件的标志。要在 Node.js 应用程序中大打开文件，可以
使用下面的异步或同步语句之一：  
```
fs.open(path, flags, [mode], callback)
fs.openSync(path, flags, [mode])
```
- path：指定文件系统的标准路径字符串。
- flags：打开文件的模式，读、写、追加等。
- mode：文件访问模式，默认为 0666，表示刻度且可写。

定义文件如何打开的标志：  
- r：
- r+：
- rs
- rs+
- w
- wx 
- w+
- wx+
- a
- ax
- a+
- ax+

一旦文件被打开，你需要关闭它以迫使操作系统把更改刷新到磁盘并释放操作系统锁。要关闭文件，可使用下列方法，并传递文件
操作符。异步 close() 方法调用，还需要指定回调函数：  
```
fs.close(fd, callback)
fs.closeSync(fd)
```
以下是以异步模式打开和关闭文件的例子。注意：回调函数被指定，且接收 err 和 fd 参数。fd 是用来读取或写入该文件的文件
描述符：  
```
fs.open("myFile", 'w', function(err, fd) {
	if (!err) {
		fs.close(fd);
	}
});
```
以下是同步模式，无回调函数，文件描述符直接从 fs.openSync() 返回：  
```
var fd = fs.openSync("myFile", 'w');
fs.closeSync(fd);
```

## 6.3 写入文件  
### 6.3.1 简单文件写入  
这些方法把一个字符串或缓冲区的全部内容写入一个文件，语法：  
```
fs.writeFile(path, data, [options], callback)
fs.writeFileSync(path, data, [options])
```
- path：文件路径，相对或绝对路径。
- data：将被写入到文件中的 String 或 Buffer 对象。
- options：一个对象，可以包含定义字符串编码，以及代开文件时使用得模式和标志的 encoding、mode 和 flag 属性。
- callback：当文件写入已经完成时被调用。

以下实现异步请求来在文件中存储 config（配置）对象的 JSON 字符串：  
```
// 将 JSON 字符串写入文件
var fs = require('fs');
var config = {
	maxFile: 20,
	maxConnections: 15,
	rootPath: "/webroot"
};
var configTxt = JSON.stringify(config);
var options = {encoding:'utf8', flag:'w'};
fs.writeFile('config.txt', configTxt, options, function(err) {
	if (err) {
		console.log("Config Write Failed.");
	} else {
		console.log("Config Saved.");
	}
});
```
输出：  
`Config Saved.`

### 6.3.2 同步文件写入  
同步方法涉及在返回执行正在运行的线程之前，将数据写入文件。这提供了使你能够在相同的代码段写入多次的优点，但如果该
文件写入控制住其他线程，它就可能是一个缺点。
同步写入文件，先用 openSync() 打开它来获取文件描述符，然后使用 fs.writeSync() 将数据写入文件。语法：  
`fs.writeSync(fd, data, offset, length, position)`
- fd：openSync() 返回的文件描述符
- data：指定将被写入文件中的 String 或 Buffer 对象
- offset：指定 data 参数中开始阅读的索引。如果想从字符串或缓冲区的当前索引开始，值应该为 null。
- length：指定要写入的字节数，可以指定 null，表示一直写到数据缓冲区的末尾
- position：指定在文件中写入的位置，null 表示使用文件当前位置

以下实现基本同步写入把一系列字符串存储到文件：  
```
// 执行同步写入文件
var fs = require('fs');
var veggieTray = ['carrots', 'celery', 'olives'];
fd = fs.openSync('veggie.txt', 'w');
while (veggieTray.length) {
	veggie = veggieTray.pop() + " ";
	var bytes = fs.writeSync(fd, veggie, null, null);
	console.log("Wrote %s %dbytes", veggie, bytes);
}
fs.closeSync(fd);
```
输出：  
```
$ node file_write_sync.js
Wrote olives  7bytes
Wrote celery  7bytes
Wrote carrots  8bytes
```

### 异步写入文件  
文件写入的异步方法在事件队列中放置一个写入请求，然后将控制返回给调用代码。除非事件循环提取出写入请求，并且执行它，
否则实际的写操作不会发生。在同一个文件上执行多个异步写入请求时，除非在执行下一个写入前等待第一个写入回调函数完成，
否则不能保证执行的顺序。通常情况下，最简单的是把写操作嵌套在上一个写操作的回调函数中。  
要异步写入一个文件，首先使用 open() 打开它，然后在打开请求的回调函数已经执行后，使用 fs.write() 将数据写入文件。
以下是 fs.write() 语法：  
`fs.write(fd, data, offset, length, position, callback)`  
- fd：openSync() 返回的文件描述符。
- data：指定将被写入文件中的 String 或 Buffer 对象。
- offset：指定要开始读取数据的输入数据中的索引。如果想从字符串或缓冲区的当前索引开始，值应该为 null。
- length：指定要写入的字节数，可以指定 null，表示一直写到数据缓冲区的末尾。
- position：指定在文件中写入的位置，null 表示使用文件当前位置。
- callback：必须是可以接受 error 和 bytes 两个参数的函数，其中 error 是在写过程中发生的错误，bytes 指定写入
字节数。

以下代码显示了如何实现基本的异步写入来把一系列字符串数据存储到一个文件。注意，open() 的 callback 所指定的回调函数
调用 writeFruit() 函数，并传递文件描述符，write() 方法的回调也调用 writeFruit() ，并传递文件描述符。这确保了异步
写入在另一个执行前完成。  
```
// 执行异步写入文件
var fs = require('fs');
var fruitBowl = ['apple', 'orange', 'banana', 'grapes'];
function writeFruit(fd) {
	if (fruitBowl.length) {
		var fruit = fruitBowl.pop() + " ";
		fs.write(fd, fruit, null, null, function(err, bytes) {
			if (err) {
				console.log("File Write Failed.");
			} else {
				console.log("Wrote: %s %dbytes", fruit, bytes);
				writeFruit(fd);
			}
			
		});
	} else {
		fs.close(fd);
	}
}
fs.open('fruit.txt', 'w', function(err, fd) {
	writeFruit(fd);
});
```
输出：  
```
$ node file_write_async.js
Wrote: grapes  7bytes
Wrote: banana  7bytes
Wrote: orange  7bytes
Wrote: apple  6bytes
```

### 6.3.4 流式文件写入  
往一个文件写入大量数据时，最好的方法之一是使用流，其中包括把文件作为一个 Writable 流打开。  
要将数据异步传送到文件，首先用以下语法创建一个 Writable 对象：  
`fs.createWritableStream(path, [options])`  
- path：指定文件路径
- options：可选，是一个对象，可以包含定义字符串编码，以及打开文件时使用得模式和标志的 encoding、mode 和 flag 
属性。
一旦打开了 Writable 文件流，就可以使用标准的流式 write(buffer) 方法来写入它。当写入完成后，再调用 end() 方法
来关闭流。  
以下代码实现了基本的 Writable 文件流。注意，代码完成写入后，执行 end() 方法，触发 close 事件。  
```
// 实现一个 Writable 流，允许流式写入一个文件
var fs = require('fs');
var grains = ['wheat', 'rice', 'oats'];
var options = {encoding: 'utf8', flag: 'w'};
var fileWriteStream = fs.createWriteStream("grains.txt", options);
fileWriteStream.on("close", function() {
	console.log("File Closed.");
});
while (grains.length) {
	var data = grains.pop() + " ";
	fileWriteStream.write(data);
	console.log("Wrote: %s", data);
}
fileWriteStream.end();
```
输出：  
```
$ node file_write_stream.js
Wrote: oats
Wrote: rice
Wrote: wheat
File Closed.
```

### 6.4.1 简单文件读取  
readFile(） 方法从文件中把全部内容读取到数据缓冲区，语法：  
```
fs.readFile(path, [options], callback)
fs.readFileSync(path, [options])
```
- path：文件路径，相对或绝对路径
- options：可选，是一个对象，可以包含定义字符串编码，以及打开文件时使用得模式和标志的 encoding、mode 和 flag 
  属性。
- callback：异步方法需要，文件读取完成时将被调用。

以下代码实现了简单的异步 readFile() 请求来从一个配置文件中读取 JSON 字符串，然后用它来创建一个 config 对象。  
```
// 读取 JSON 字符串文件到一个对象
var fs = require('fs');
var options = {encoding:'utf8', flag:'r'};
fs.readFile('config.txt', options, function(err, data) {
	if (err) {
		console.log("Failed to open Config File.");
	} else {
		console.log("Config Loaded.");
		var config = JSON.parse(data);
		console.log("Max Files: " + config.maxFilse);
		console.log("Max Connecttions: " + config.maxConnections);
		console.log("Root Path: " + config.rootPath);
	}
});
```
输出：  
```
$ node file_read.js
Config Loaded.
Max Files: undefined
Max Connecttions: 15
Root Path: /webroot
```

### 6.4.2 同步文件读取  
文件读取的同步方法涉及在返回执行正在运行的线程之前，读取文件中的数据。这提供了使你能够在代码相同的部分多次读取
的优点，但如果该文件读取操作控制住其他线程，它就可能是一个缺点。  
要同步读取一个文件，先用 openSync() 打开它来获取一个文件描述符，然后使用 readSync() 从文件中读取数据。语法：  
`fs.readSync(fd, buffer, offset, length, position)`  
- fd：openSync() 返回的文件描述符。
- buffer：指定将被从文件中读入的 Buffer 对象。
- offset：指定缓冲区将开始写入数据的索引；置为 null，表示从缓冲区的当前索引处开始。
- position：指定文件中开始读取的位置；置为 null，表示使用文件的当前位置。

以下代码实现从一个文件中读取字符串数据开的基本同步读取：  
```
// 执行从文件同步读取
var fs = require('fs');
fd = fs.openSync('veggie.txt', 'r');
var veggies = "";
do {
	var buf = new Buffer(5);
	buf.fill();
	var bytes = fs.readSync(fd, buf, null, 5);
	console.log("read %dbytes", bytes);
	veggies += buf.toString();
} while (bytes > 0);
fs.closeSync(fd);
console.log("Veggies: " + veggies);
```
输出：  
```
$ node file_read_sync.js
read 5bytes
read 5bytes
read 5bytes
read 5bytes
read 2bytes
read 0bytes
Veggies: olives celery carrots
```

### 6.4.3 异步文件读取  
文件读取的异步方法在事件队列中放置一个读取请求，然后将控制返回给调用代码。除非事件循环提取出读取请求，并且执行它，
否则实际的读操作不会发生。在同一个文件上执行多个异步读取请求时，除非在执行下一个读取前等待第一个读取回调函数完成，
否则不能保证执行的顺序。通常情况下，最简单的是把写操作嵌套在上一个读取操作的回调函数中。  
要从异步文件中读取，首先使用 open() 打开它，然后在来自打开请求的回调函数已经执行后，使用 read() 读取文件数据。
以下是 read() 语法：  
`fs.read(fd, buffer, offset, length, position, callback)`
- fd：openSync() 返回的文件描述符。
- buffer：指定将被从文件中读入的 Buffer 对象。
- offset：指定缓冲区将开始写入数据的索引；置为 null，表示从缓冲区的当前索引处开始。
- position：指定文件中开始读取的位置；置为 null，表示使用文件的当前位置。
- callback：必须是可以接受 error、bytes 和 buffer 这三个参数的函数。
    - error：读取过程发生的错误
    - bytes：读取的字节数
    - buffer：从读请求填充数据的缓冲区

以下代码从一个文件中异步读取数据块。注意，open() 的回调函数调用 readFruit() 函数，并传递文件描述符。 read() 的
回调函数也调用 readFruit()，并传递文件描述符，这保证了异步读取在另一个读取之前完成。
```
// 执行从文件异步读取
var fs = require('fs');
function readFruit(fd, fruits) {
	var buf = new Buffer(5);
	buf.fill();
	fs.read(fd, buf, 0, 5, null, function(err, bytes, data) {
		if (bytes > 0) {
			console.log("read %dbytes", bytes);
			fruits += data;
			readFruit(fd, fruits);
		} else {
			fs.close(fd);
			console.log("Fruits: %s", fruits);
		}
	});
}
fs.open('fruit.txt', 'r', function(err, fd) {
	readFruit(fd, "");
});
```

输出：  
```
$ node file_read_async.js
read 5bytes
read 5bytes
read 5bytes
read 5bytes
read 5bytes
read 2bytes
Fruits: grapes banana orange apple
```

### 6.4.4 流式文件读取  
要异步从文件传输数据，首先创建一个 Readable 流对象：  
`fs.createReadStream(path, [options])`  
- path：指定文件路径，相对或绝对路径。
- options：可选，是一个对象，可以包含定义字符串编码，以及打开文件时使用得模式和标志的 encoding、mode 和 flag 
属性。

当打开 Readable 文件流后，可以用过使用 readable 事件和 read() 请求，或通过实现 data 事件处理程序轻松地从它
读出。
以下代码实现了一个基本的 Readable 文件流。
```
// 实现 Readable 流，使得能够流式读取一个文件
var fs = require('fs');
var options = {encoding: 'utf8', flag: 'r'};
var fileReadStream = fs.createReadStream("grains.txt", options);
// data 事件处理程序不断地从流中读取数据
fileReadStream.on('data', function(chunk) {
	console.log('Grains: %s', chunk);
	console.log('Read %d bytes of data.', chunk.length);
});
fileReadStream.on("close", function() {
	console.log("File Closed.");
});
```
输出：  
```
$ node file_read_stream.js
Grains: oats rice wheat
Read 16 bytes of data.
File Closed.
```

## 6.5 其他文件系统任务  
### 6.5.1 验证路径的存在性  














