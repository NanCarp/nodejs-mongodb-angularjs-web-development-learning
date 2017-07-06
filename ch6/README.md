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

















