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
- r：打开文件用于读取。如果该文件不存在，则会出现异常
- r+：打开文件用于读写。如果该文件不存在，则会出现异常
- rs：在同步模式下打开文件用于读取。这与强制使用 fs.openSync() 不一样。当使用这种模式时，操作系统将绕过本地文件系统
缓存。因为它可以跳过可能是小的本地缓存，所以这对 NFS 挂在是有用的。你用该只在必要时使用该标志，因为它可能对性能产生
负面影响
- rs+：同 rs，除了打开文件用于读写外
- w：打开文件用于写操作，如果它不存在，就创建该文件；或者如果它确实存在，则截断该文件
- wx：同 w；但如果路径存在，则打开失败
- w+：打开文件用于读写。如果它不存在，就创建该文件；或者如果它确实存在，则截断该文件
- wx+：同 w+；但如果路径存在，则打开失败
- a：打开文件用于追加。如果它不存在，则创建该文件
- ax：同 a；但如果路径存在，则打开失败
- a+：打开文件用于读取和追加。如果它不存在，则创建该文件
- ax+：同 a+；但如果路径存在，则打开失败

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
在对文件或目录执行任何形式的读/写操作之前，都要验证路径是否存在。可以使用以下方法：  
```
fs.exists(path, callback)
fs.existsSync(path)
```
fs.existsSync(path) 返回 true 或 false ，这取决于路径是否存在。fs.exists() 的回调函数将被传入 true 或 false，
例如，下面的代码验证在当前路径中以 filesystem.js 命名的文件是否存在，并显示验证的结果：  
```
fs.exists('filesystem.js', function (exists) {
	console.log(exits ? "Path Exists" : "Path Does Not Exist");
}):
```

### 6.5.2 获取文件信息  
获取文件系统对象的基本信息，如文件大小、模式、修改时间，以及条目是否是一个文件或文件夹等。使用下面的调用：  
```
fs.stats(path, callback)
fs.statsSync(path)
```
fsStatsSync() 方法返回一个 Stats 对象。执行 fs.stats() 方法，Stats 对象作为第二个参数被传递到回调函数。第一个
参数是 error。  
附加到 Stats 对象上的最常用的属性和方法：  
- isFile()：如果该条目是一个文件，则返回 true
- isDirectory()：如果该条目是一个目录，则返回 true
- isSocket()：如果该条目是一个套接字，则返回 true
- dev：指定文件所在的设备 ID
- mode：指定文件的访问模式
- size：指定文件的字节数
- blksize：指定用于存储文件的快的大小，以字节为单位
- blocks：指定文件在磁盘上占用的块的数目
- atime：指定上次访问文件的时间
- mtime：指定文件的最后修改时间
- ctime：指定文件的创建时间

下面代码先执行 fs.stats() 调用，然后作为 JSON 字符串输出对象的结果，并使用 isFile()、isDirector() 和 isSocket()
调用，说明了如何使用 fs.stas() 调用：  
```
// 实现一个 fs.stats() 调用来检索有关文件的信息
var fs = require('fs');
fs.stat('file_stats.js', function (err, stats) {
	if (!err) {
		console.log('stats: ' + JSON.stringify(stats, null, ' '));
		console.log(stats.isFile() ? "Is a File" : "Is not a File");
		console.log(stats.isDirectory() ? "Is a Folder" : "Is not a Folder");
		console.log(stats.isSocket() ? "Is a Socket" : "Is not a Socket");
		stats.isDirectory();
		stats.isBlockDevice();
		stats.isCharacterDevice();
		//stats.isSymbolicLink(); //only lstat
		stats.isFIFO();
		stats.isSocket();
	}
});
```
输出：  
```
$ node file_stats.js
stats: {
 "dev": -996849395,
 "mode": 33206,
 "nlink": 1,
 "uid": 0,
 "gid": 0,
 "rdev": 0,
 "ino": 147211412819692740,
 "size": 577,
 "atime": "2017-07-07T13:57:45.893Z",
 "mtime": "2017-07-07T14:04:33.741Z",
 "ctime": "2017-07-07T14:04:33.741Z",
 "birthtime": "2017-07-07T13:57:45.892Z"
}
Is a File
Is not a Folder
Is not a Socket
```

### 6.5.3 列出文件  
常见任务：列出在目录中的文件和文件夹——例如列出一个目录中的文件，以确定是否需要进行清理；在目录结构上动态操作等。  
可以使用以下名利读取条目列表来访问文件系统中的文件：  
```
fs.readdir(path, callback)
fs.readdirSync(path)
```
readdirSync() 返回指定路径中条目名称的字符串数组。 readdir() ，该列表作为第二个参数被传递给回调函数，如果有错误，
此错误作为第一个参数传递。  
下面实现了一个嵌套的回调链来遍历目录结构并输出其中的条目。注意，回调函数实现了一个包装器，它提供一个 fullPath 变量
的闭包，并且通过一部回调函数使 WalkDirs() 函数循环：  
```
// 实现一个回调链来遍历和输出目录结构的内容
var fs = require('fs');
var Path = require('path');
function WalkDirs(dirPath) {
	console.log(dirPath);
	fs.readdir(dirPath, function(err, entries) {
		for (var idx in entries) {
			var fullPath = Path.join(dirPath, entries[idx]);
			(function(fullPath) {
				fs.stat(fullPath, function(err, stats) {
					if (stats && stats.isFile()) {
						console.log(fullPath);
					} else {
						WalkDirs(fullPath);
					}
				});
			})(fullPath);
		}
	});
}
WalkDirs("../ch6");
```
输出：  
```
$ node file_readdir.js
../ch6
..\ch6\config.txt
..\ch6\file_read.js
..\ch6\file_readdir.js
..\ch6\file_read_async.js
..\ch6\file_read_stream.js
..\ch6\file_read_sync.js
..\ch6\file_stats.js
..\ch6\file_write.js
..\ch6\file_write_sync.js
..\ch6\file_write_async.js
..\ch6\file_write_stream.js
..\ch6\README.md
..\ch6\fruit.txt
..\ch6\grains.txt
..\ch6\other.js
..\ch6\test
..\ch6\veggie.txt
..\ch6\test\test.js
```

### 6.5.4 删除文件  
命令：  
```
fs.unlink(path, callback)
fs.unlinkSync(path)
```
unlinkSync(path) 函数返回 true 或 false，这取决于是否删除成功。如果删除该文件时遇到错误，异步的 unlink() 调用
就传回一个错误值给回调函数。  
下面代码使用 unlink() 异步 fs 调用删除 new.txt 文件：  
```
fs.unlink("new.txt", function(err) {
	console.log(err ? "File Deleted Failed" : "File Deleted");
});
```

### 6.5.5 截断文件  
截断（Truncate）文件是指通过把文件结束处设置为比当前值小的值来减小文件的大小。可能需要截断不断增长，但不包含
关键数据的文件（例如，临时日志）。可使用下面的 fs 调用之一来截断文件，传入希望文件截断完成时要包含的字节数：  
```
fs.truncate(path, len, callback)
fs.truncateSync(path, len)
```
fs.truncateSync(path) 函数返回 true 或 false，这取决于是否截断成功。如果截断该文件时遇到错误，异步的 truncate() 
调用就传回一个错误值给回调函数。
下面代码把 log.txt 的文件截断成零字节：  
```
fs.truncate("log.txt", function(err) {
	console.log(err ? "File Truncate Failed" : "File Truncated");
});
```

### 6.5.6 建立和删除目录  
从 Node.js 添加目录，使用以下 fs 调用之一：  
```
fs.mkdir(path, [mode], callback)
fs.mkdirSync(path, [mode])
```
- path：可以是绝对或相对路径
- mode：可选，指定新目录的访问模式

mkdirSync(path)  返回 true 或 false，取决于目录是否已经成功创建。另一方面，如果遇到错误，异步的 mkdir() 调用
传递一个 error 值给回调函数。  
使用异步方法的时候，需要等待创建目录的回调函数完成后，才能创建该目录的子目录。下面演示了如何将创建一个子目录
结构的操作链接在一起：  
```
fs.mkdir("./data", function(err) {
	fs.mkdir("./data/folderA", function(err) {
		fs.mkdir("./data/folderA/folderB", function(err) {
			fs.mkdir("./data/folderA/folderB/folderD", function(err) {
				
			});
		});
		fs.mkdir("./data/folderA/folderC", function(err) {
			fs.mkdir("./data/folderA/folderC/folderE", function(err) {
				
			});
		});
	});
});
```
要从 Node.js 删除目录：  
```
fs.rmdir(path, callback)
fs.rmdirSync(path)
```
rmdirSync(path)  返回 true 或 false，取决于目录是否已经成功删除。另一方面，如果遇到错误，异步的 rmdir() 调用
传递一个 error 值给回调函数。  
使用异步方法的时候，再删除父目录之前，需要等待删除该目录的回调函数完成。下面演示了如何将删除子目录结构的操作
链接在一起：  
```
fs.rmdir("./data/folderA/folderB/folderC", function(err){
	fs.rmdir("./data/folderA/folderB", function(err) {
		fs.rmdir("./data/folderD", function(err) {
			
		});
	});
	fs.rmdir("./data/folderA/folderC", function(err) {
		fs.rmdir("./data/folderE", function(err) {
			
		});
	});
});
```

### 6.5.7 重命名文件和目录  
```
fs.rename(oldPath, newPath, callback)
fs.renameSync(oldPath, new Path)
```
oldPath 指定现有的文件或目录的路径，而 newPath 指定新名称。renameSync(path) 返回 true 或 false，取决于文件或
目录是否已经成功更名。遇到错误，异步 remane() 调用传递 error 给回调函数。  
下面代码，把一个名为 old.txt 的文件重命名为 new.txt，并把一个名为 testDir 的目录重命名为 renamedDir：  
```
fs.rename("old.txt", "new.txt", function(err) {
	console.log(err ? "Rename Failed" : "File Renamed");
});

fs.rename("testDir", "renameDir", function(err) {
	console.log(err ? "Rename Failed" : "Folder Renamed");
});
```

### 6.5.8 监视文件更改
监视文件，在文件发生变化时执行回调函数。如果希望当文件被修改时触发事件的发生，但不希望从应用程序中直接不断地
轮询，这会很有用。但是监视在底层操作系统中产生了一些开销，适可而止地使用。  
监视文件，课使用下面的命令传递想要见识的文件的 path（路径）：  
`fs.wathcFile(Path, [optins], callback)`  
可以传入 options 对象，它包含 persistent（持续）和 interval 属性。如果想持续监视，设置 persistent 属性为 true。
interval 属性指定所需的文件更改的轮询时间，以毫秒为单位。  
当文件发生变化时，callback 函数就会执行，并传递 Stats 对象。  
下面代码每个 5 秒监视 log.txt 文件，并使用 Stats 对象来输出本次和上次文件被修改的时间：  
```
fs.watchFile("log.txt", {persistent:true, interval:5000}, function (curr, prev) {
    console.log("log.txt modified at: " + curr.mtime);
    console.log("Previous modification was: " + prev.mtime);
});
```

















