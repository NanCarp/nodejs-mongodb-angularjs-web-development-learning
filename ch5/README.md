---
title: 在 Node.js 中处理数据 I/O
date: 2017-07-03 20:31:00
tags: Node.js MongoDB AngularJS Web 学习
---
## 5.1 处理 JSON  
### 把 JSON 转换成 JavaScript 对象  
例如，下面的代码片段中，注意 accountStr 被定义为一个格式化的 JSON 字符串，然后使用 JSON.parse() 将其转换为 
JavaScript 对象，之后其成员属性就可以通过点符号来访问：  
```
var accountStr = '{"name":"Jedi", "members":["Yoda","Obi Wan"], \
				   "number":34512, "location": "A galaxy far, far away"}';
var accountObj = JSON.parse(accountStr);
console.log(accountObj.name);
console.log(accountObj.members);
```
输出：  
```
$ node other.js
Jedi
[ 'Yoda', 'Obi Wan' ]
```

### 5.1.2 把 JavaScript 对象转化为 JSON 对象  
下面定义了一个包括字符串、数字和数组属性的 JavaScript 对象。JSON.stringify() 将其转换成 JSON 字符串：  
```
var accountObj = {
	name: "Baggins",
	number: 10645,
	numbers: ["Frodo, Bilbo"],
	location: "Shire"
};
var accountStr = JSON.stringify(accountObj);
console.log(accountStr);
```
输出：  
`{"name":"Baggins","number":10645,"numbers":["Frodo, Bilbo"],"location":"Shire"}`  

## 5.2 使用 Buffer 模块缓冲数据  
### 5.2.2 创建缓冲区  
Buffer 对象实际上是原始的内存分配区。因此，必须在创建时确定其大小。创建 3 种方法：  
```
new Buffer(sizeInBytes)
new Buffer(octetArray)
new Buffer(string, [encodeing])
```
例如，下面分别使用字节大小、一个八位字节的缓冲区，以及一个 UTF8 字符串来设定缓冲区：  
```
var buf256 = new Buffer(256);
var bufOctets = new Buffer([0x6f, 0x63, 0x74, 0x65, 0x74, 0x73]);
var bufUTF8 = new Buffer("Some UTF Text \uoob6 \u30c6 \u20ac", 'utf8');
```

### 5.2.3 写入缓冲区  
 下面代码定义了一个缓冲区，以零填充。write() 方法在开头写一些文字，write(string, offset, length) 写额外的文本
 改变现有缓冲区的一部分。通过直接设置索引的值增加 + 到结束处。注意，buf256.write("more text", 9, 9) 语句写到
 缓冲区的中间，而 buf256[18] = 43 修改一个字节。
```
// buffer_write.js：用各种方式来写入 Buffer 对象
buf256 = new Buffer(256);
buf256.fill(0);
buf256.write("add some text");
console.log(buf256.toString());
buf256.write("more text", 9, 9);
console.log(buf256.toString());
buf256[18] = 43;
console.log(buf256.toString());
```
输出：  
```
$ node buffer_write.js
add some text



add some more text



add some more text+
```


### 5.2.4 从缓冲区读取  
最简单使用 toString() 方法将缓冲区的全部或一部分转换为字符串。也可以直接在缓冲区访问特定的索引，或使用 read()。
此外，Node.js 提供 StringDecoder 对象，它有 write(buffer) 方法来进行解码，并使用指定的编码写入缓冲区数据。  
一下代码定义了 UTF8 编码的字符缓冲区，然后使用不带参数的 toString() 读取所有的缓冲区，之后用 encoding、start 
和 end 参数读取缓冲区的一部分。然后使用 UTF8 编码创建 StringDecoder，并用它来把缓冲区的内容输出到控制台，
接下来，直接访问方法获取在索引 18 处的八进制字节值，用 readUInt32BE() 读取一个 32 位整数。  
```
// buffer_read.js： 从 Buffer 对象读取数据的各种方法
bufUTF8 = new Buffer("Some UTF8 Text \u00b6 \u30c6 \u20ac", 'utf8');
console.log(bufUTF8.toString());
console.log(bufUTF8.toString('utf8', 5, 9));
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');
console.log(decoder.write(bufUTF8));
console.log(bufUTF8[18].toString(16));
console.log(bufUTF8.readUInt32BE(18).toString(16));
```
输出：  
```
$ node buffer_read.js
Some UTF8 Text ¶ テ €
UTF8
Some UTF8 Text ¶ テ €
e3
e3838620
```

### 5.2.5 确定缓冲区长度  
缓冲区处理的一项常见任务是确定其长度，尤其是当你从一个字符串动态创建一个缓冲区的时候。你可以通过在 Buffer 对象上
调用 .length 来确定缓冲区的长度。确定字符串将在缓冲区中占用的字节长度，不能使用 .length 属性，而是用 
Buffer.byteLength(string, [encoding])。注意，缓冲区中字符串长度和字节长度直接的区别很重要，以下语句可以说明： 
```
“UTF8 text \u00b6".length;
// 计算结果是 11
BUffer.byteLength("UTF8 text \u00b6", 'utf8');
// 计算结果是 12，因为它包含双字节字符
Buffer("UTF8 text \u00b6").length;
// 计算结果是 12，缓冲区上的 .length 返回的是字节长度
```

### 5.2.6 复制缓冲区  
Node.js 为 Buffer 对象提供 copy(targetBuffer, [targetStart], [sourceStart], [sourceIndex]) 函数。
targetBuffer 参数是另一个 Buffer 对象， targetStart、sourceStart 和 sourceEnd 是源和目标缓冲区内的索引。  

> **注意**  
> 若要从一个缓冲区复制字符串数据到另一个缓冲区，应确保两个缓冲区使用相同的编码；否则，对结果缓冲区解码时，
> 可能得到意想不到的结果。  

也可以通过直接索引将一个缓冲区中的数据复制到另一个缓冲区，例如：  
`sourceBuffer[index] = destinationBuffer[index]`  

下面代码说明了将一个缓冲区的数据复制到另一个缓冲区的 3 个例子。  
```
var alphabet = new Buffer('abcdefghijklmnopqrstuvwxyz');
console.log(alphabet.toString());
// copy full buffer 
var blank = new Buffer(26);
blank.fill();
console.log("Blank: " + blank.toString());
alphabet.copy(blank);
console.log("Blank: " + blank.toString());
// copy part of buffer
var dashes = new Buffer(26);
dashes.fill('-');
console.log("Dashes: " + dashes.toString());
alphabet.copy(dashes, 10, 10, 15);
console.log("Dashes: " + dashes.toString());
// copy to and from direct indexes of buffers
var dots = new Buffer('----------------------------');
dots.fill('.');
console.log("dots: " + dots.toString());
for (var i = 0; i < dots.length; i++) {
	if (i % 2) {
		dots[i] = alphabet[i];
	}
}
console.log("dots: " + dots.toString());
```
输出：  
```
$ node buffer_copy.js
abcdefghijklmnopqrstuvwxyz
Blank:
Blank: abcdefghijklmnopqrstuvwxyz
Dashes: --------------------------
Dashes: ----------klmno-----------
dots: ............................
dots: .b.d.f.h.j.l.n.p.r.t.v.x.z.
```

### 5.2.7 对缓冲区切片  
**切片（slice）** 是缓冲区的开始索引能和结束索引之间的部分。对缓冲区切片可以让你操作一个特定的快。  
可以使用 slice([start], [end]) 创建切片，它返回一个 Buffer 对象，其指向原缓冲区的 start 索引，并具有 
end - start 的长度。请记住，切片与副本不同。编辑副本不影响原缓冲区，**编辑切片，会改变原缓冲区**。  
示例：  
```
// 创建和操作一个 Buffer 对象的切片
var numbers = new Buffer("123456789");
console.log(numbers.toString());
var slice = numbers.slice(3, 6);
console.log(slice.toString());
slice[0] = '#'.charCodeAt(0);
console.log(slice.toString());
console.log(numbers.toString());
```
输出：  
```
$ node buffer_slice.js
123456789
456
#56
123#56789
```

### 5.2.8 拼接缓冲区  
可以把两个或多个 Buffer 对象拼接在一起，形成一个新的缓冲区。concat(list, [totalLength]) 方法接受 Buffer 对象
的数组作为第一个参数，并把定义缓冲区最大字节数的 totalLength 作为可选的第二个参数。Buffer 对象按照他们出现在列表
中的顺序被拼接，一个新的 Buffer 对象被返回，它包含至多 totalLength 字节的原始缓冲区的内容。  
如果不提供 totalLength 参数，concat() 就计算出总长度。但是，这样它必须遍历列表，所以提供 totalLength 执行得更快
一点。
一下代码线拼接基 Buffer 对象和一个缓冲区，然后再拼接另一个缓冲区。  
```
// 拼接 Buffer 字符串
var af = new Buffer("African Swallow?");
var eu = new Buffer("European Swallow?");
var question = new Buffer("Air Speed Velocity of an ");
console.log(Buffer.concat([question, af]).toString());
console.log(Buffer.concat([question, eu]).toString());
```
输出：  
```
$ node buffer_concat.js
Air Speed Velocity of an African Swallow?
Air Speed Velocity of an European Swallow?
```

## 5.3 使用 Stream 模块来传递数据  
数据流是可读，可写，或既可读又可写的内存结构。  
流的目的是提供一种从一个地方向另一个地方传送数据的通用机制。它们还公开各种事件，如数据可被读取时的 data，当
错误发生时的 error 等等，这样可以注册监听器来在流变为可用或已准备好被写入时处理数据。  
流一般用于 HTTP 数据和文件。可以作为读取流，打开文件，或者从 HTTP 请求访问数据，并读出所需的字节。  

### 5.3.1 Readable 流  
Readable 流旨在提供一种机制，以方便地读取从其他来源进入应用程序的数据。  
常见实例：  
- 在客户端的 HTTP 响应
- 在服务器的 HTTP 请求
- fs 读取流
- zlib 流
- TCP 套接字
- 子进程的 stdout 和 stderr
- process.stdin

Readable 流提供 read([size]) 方法来读取数据，size 指定从流中读取的字节数。read() 可以返回一个 String 对象、
Buffer 对象或 null。Readable 流也公开了以下事件：  
- readable：在数据块可以从流中读取的时候发出。
- data：类似于 readable，不同之处在于，当数据的事件处理程序被连接时，流转变成流动的模式，并且数据处理程序被
连续地调用，直到所有数据都被用尽。
- end：当数据将不再被提供时由流发出。
- close：当底层的资源，如文件，已关闭时发出。
- error：当在接收数据中出现错误时发出。

Readable 对象也提供了许多函数： 
- read([size])：从流中读取数据。这些数据可以是 String、Buffer 或者 null （null 表示没有剩下任何更多的数据）。
如果指定 size 参数，那么被读取的数据将仅限于那个字节数。
- setEncoding(encoding)：设置从 read() 请求读取返回 String 时使用的编码。
- pause()：暂停从该对象发出的 data 事件。
- resume()：恢复从该对象发出的 data 事件。
- pipe(destination, [options])：把这个流的输出传输到 destination（目的地）指定的 Writable 流对象。options 是
一个 JavaScript 对象。例如，{end:true} 当 Readable 结束时就结束 Writable 目的地。
- unpipe([destination])：从 Writable 目的地断开这一对象。

为了实现自定义 Readable 流对象，需要首先继承 Readable 流的功能。最简单的方法是使用 util 模块的 inherits() 方法：
```
var util = require('util');
util.inherits(MyReadableStream, stream.Readable);
```
然后创建对象调用的实例：  
`stream.Readable.call(this, opt);`  
还需要实现一个调用 push() 来输出 Readable 对象中的数据的 _read() 方法。push() 调用应推入的是一个 String、
Buffer 或者 null。  
下面实现了一个 Readable 流，并从中读取数据。注意，Answers() 类继承自 Readable，然后实现了 
Answers.prototype._read() 函数来处理数据的推出。
```
// 实现一个 Readable 流对象
var stream = require('stream');
var util = require('util');
util.inherits(Answers, stream.Readable);
function Answers(opt) {
	stream.Readable.call(this, opt);
	this.quotes = ["yes", "no", "maybe"];
	this._index = 0;
}
Answers.prototype._read = function() {
	if (this._index > this.quotes.length) {
		this.push(null);
	} else {
		this.push(this.quotes[this._index]);
		this._index += 1;
	}
}
var r = new Answers();
// 直接 read() 调用从流中读取第一个条目
console.log("Direct read: " + r.read().toString());
// 数据处理程序读取其余条目
r.on('data', function(data){
	console.log("Callback read: " + data.toString());
});
r.on('end', function(data){
	console.log("No more answers.");
});
```
输出：  
```
$ node stream_read.js
Direct read: yes
Callback read: no
Callback read: maybe
No more answers.
```

### 5.3.2 Writable 流  
Writable 流旨在提供把数据写入一种可以轻松地在代码的另一个区域被使用的形式的机制。  
Writable 流的常见实例：  

- 在客户端的 HTTP 请求
- 在服务器的 HTTP 响应
- fs 写入刘
- zlib 流
- TCP 套接字
- 子进程的 stdin
- process.stdout 和 process.stderr

Writable 流提供 write(chunk, [encoding], [callback]) 方法来将数据写入流中。其中，chunk（数据块）中包含要
写入的数据；encoding 指定字符串的编码；callback 指定当数据已经完全刷新时执行的一个回调函数。如果数据被成功写入，
则 write() 函数返回 true。  
Writable 公开了以下事件：  

- drain：在 write() 调用返回 false 后，当准备好开始写更多的数据时，发出此事件通知监听器。
- finish：当 end() 在 Writable 对象上被调用，所有的数据都被刷新，并且不会有更多的数据将被接收时发出此事件。
- pipe：当 pipe() 方法在 Readable 流上被调用，以添加此 Writable 为目的地时，发出此事件。
- unpipe： 当 unpipe() 方法在 Readable 流上被调用，以删除此 Writable 为目的地时，发出此事件。

可用的 Writable 流对象的方法：  

- write(chunk, [encoding], [callback])：将数据块写入流对象的数据位置。该数据可以是字符串或缓冲区。如果
指定 encoding，那么将其用于对字符串数据的编码。如果指定 callback，那么它在数据已被刷新后调用。
- end([chunk], [encoding], [callback])：与 write() 相同，但是它把 Writable 对象置于不再接收数据的状态，
并发送 finish 事件。

实现自定义 Writable 流对象，首先继承 Writable 流的功能，使用 util模块的 inherits() 方法：  
```
var util = require('util');
util.inherits(MyWritableStream, stream.Writable);
```
创建对象调用的实例：  
`stream.Writable.call(this, opt);`  
还需实现一个 _write(data, encoding, callback) 方法存储 Writable 对象的数据。  
下面代码说明了实现和写入 Writable 流的基本知识：  
```
// 实现一个 Writable 流对象
var stream = require('stream');
var util = require('util');
util.inherits(Writer, stream.Writable);
function Writer(opt) {
	stream.Writable.call(this, opt);
	this.data = new Array();
}
Writer.prototype._write = function(data, encoding, callback) {
	this.data.push(data.toString('utf8'));
	console.log("Adding: " + data);
	callback();
};
var w = new Writer();
for (var i = 1; i <= 5; i++) {
	w.write("Item" + i, 'utf8');
}
w.end("ItemLast");
console.log(w.data);
```
输出：  
```
$ node stream_write.js
Adding: Item1
Adding: Item2
Adding: Item3
Adding: Item4
Adding: Item5
Adding: ItemLast
[ 'Item1', 'Item2', 'Item3', 'Item4', 'Item5', 'ItemLast' ]
```

### 5.3.3 Duplex 流  
Duplex（双向）流是结合可读写功能的流。Duplex 流的很好地例子是 TCP 套接字连接。可在创建套接字后读取和写入它。  
实现自定义 Duplex 流对象，首先继承 Duplex 流的功能，使用 util 模块的 inherits() 方法：  
```
var util = require('util');
util.inherits(MuDuplexStream, stream.Duplex);
```
然后创建对象调用实例：  
`stream.Duplex.call(this, opt);`
创建一个 Duplex 流的 opt 参数接受一个 allowHalfOpen 数次那个设置为 true 或 false 的对象。true：即使可写入端
已经结束，可读取端也保持打开状态，反之亦然。false：结束可写入端也会结束可读取端，反之亦然。 
当实现一个全 Duplex 流时，在原型化 Duplex 类的时候需要同时实现 _read(size) 和 _write(data, encoding, callback)
方法。  
下面代码实现、写入、读取 Duplex 流。Duplex() 类继承自 Duplex 流，并实现了基本的 _write() 函数来将数据存储在该
对象中的数组内。_read() 函数使用 shift() 来获得此数组的第一个条目，如果等于“stop”，那么推入 null；如果有值，
那么推入它；或者如果没有值，则设置超时时间定时器来回调到 _read() 函数。  
```
// 实现 Duplex 流对象
var stream = require('stream');
var util = require('util');
util.inherits(Duplexer, stream.Duplex);
function Duplexer(opt) {
	stream.Duplex.call(this, opt);
	this.data = [];
}
Duplexer.prototype._read = function readItem(size) {
	var chunk = this.data.shift();
	if (chunk == "stop") {
		this.push(null);
	} else {
		if (chunk) {
			this.push(chunk);
		} else {
			setTimeout(readItem.bind(this), 500, size);
		}
	}
};
Duplexer.prototype._write = function(data, encoding, callback) {
	this.data.push(data);
	callback();
};
var d = new Duplexer();
d.on('data', function(chunk){
	console.log('read: ', chunk.toString());
});
d.on('end', function(){
	console.log('Message Complete');
});
d.write("I think, ");
d.write("therefore ");
d.write("I am.");
d.write("Rene Descartes");
d.write("stop");
```
输出：  
```
$ node stream_duplex.js
read:  I think,
read:  therefore
read:  I am.
read:  Rene Descartes
Message Complete
```

### 5.3.4 Transform 流  
Transform（变换）流扩展了 Duplex 流，但它修改 Writable 流和 Readable 流之间的数据。当需要修改从一个系统到
另一个系统的数据时，此类型会非常有用。  
实例：  
- zlib 流
- crypto 流

Duplex 和 Transform 流区别：Transform 流不用实现 _read() 和 _write() 原型方法。这些被作为直通函数提供。但是
需要实现 _transform(chunk, encoding, callback) 和 _flush(callback) 方法。此 _transform() 方法应该接受来自 
write() 请求的数据，对其修改，并推出修改后的数据。  

以下代码，实现 Transform 流，这个流接受 JSON 字符串，将它们转换为对象，然后发出发送对象的名为 object 的自定义
事件给所有监听器。该 _transform() 函数也修改对象来包括一个 handled 属性，然后以字符串形式发送。  
```
// 实现 Transform 流对象
var stream = require('stream');
var util = require('util');
util.inherits(JSONObjectStream, stream.Transform);
function JSONObjectStream(opt) {
	stream.Transform.call(this, opt);
}
JSONObjectStream.prototype._transform = function(data, encoding, callback) {
	object = data ? JSON.parse(data.toString()) : "";
	this.emit("object", object);
	object.handled = true;
	this.push(JSON.stringify(object));
	callback();
};
JSONObjectStream.prototype._flush = function(cb) {
	cb();
};
var tc = new JSONObjectStream();
tc.on("object", function() {
	console.log("Name: %s", object.name);
	console.log("Color: %s", object.color);
});
tc.on("data", function(data) {
	console.log("Data: %s", data.toString());
});
tc.write('{"name":"Carolinus", "color": "Green"}');
tc.write('{"name":"Solarius", "color": "Blue"}');
tc.write('{"name":"Lo Tae Zhao", "color": "Gold"}');
tc.write('{"name":"Ommadon", "color": "Red"}');
```
输出：  
```
$ node stream_transform.js
Name: Carolinus
Color: Green
Data: {"name":"Carolinus","color":"Green","handled":true}
Name: Solarius
Color: Blue
Data: {"name":"Solarius","color":"Blue","handled":true}
Name: Lo Tae Zhao
Color: Gold
Data: {"name":"Lo Tae Zhao","color":"Gold","handled":true}
Name: Ommadon
Color: Red
Data: {"name":"Ommadon","color":"Red","handled":true}
```

### 5.3.5 把 Readable 流用管道输送到 Writable 流  
通过 pipe(writableStream, [options]) 函数把 Readable 流的输出直接输入到 Writable 流。options 参数接受一个 
end 属性为 true 或 false 的对象。true：Writable 流随着 Readable 流的结束而结束。这是默认行为。例如：  
`readStream.pipe(writeStream, {end:true});`  
可以使用 unpipe(destinationStream) 选项来打破管道。  
下面代码实现了一个 Readable 流和 Writable 流，然后使用 pipe() 函数把它们链接在一起。  
```
// 把 Readable 流传送到 Writable 流
var stream = require('stream');
var util = require('util');
util.inherits(Reader, stream.Readable);
util.inherits(Writer, stream.Writable);
function Reader(opt) {
	stream.Readable.call(this, opt);
	this._index = 1;
}
Reader.prototype._read = function(size) {
	var i = this._index++;
	if (i > 10) {
		this.push(null);
	} else {
		this.push("Item " + i.toString());
	}
};
function Writer(opt) {
	stream.Writable.call(this, opt);
	this._index = 1;
}
Writer.prototype._write = function(data, encoding, callback) {
	console.log(data.toString());
	callback();
};
var r = new Reader();
var w = new Writer();
r.pipe(w);
```
输出：  
```
$ node stream_piped.js
Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10
```

## 5.4 用 Zlib 压缩与解压缩数据  
在使用大的系统或移动大量数据时，压缩/解压缩数据的能力极为有用。  
记住，压缩数据需要花费 CPU 周期，所以在招致压缩/解压缩成本之前，应该确信压缩数据会带来好处。  
Zlib 支持如下压缩方法：  
- gzip/gunzip：标准 gzip 压缩。
- deflate/inflate：基于 Huffman 编码的标准 deflate 压缩算法。
- deflateRaw/inflateRaw：针对原始缓冲区的 deflate 压缩算法。

### 5.4.1 压缩和解压缩缓冲区  
Zlib 模块提供了几个辅助含税，基本格式 function(buffer, callback)，其中 buffer 是被压缩/解压缩的缓冲区，
callback 是压缩/解压缩发生之后所执行的回调函数。  
以下几种示例：  
```
// 使用 Zlib 模块压缩/解压缩缓冲区
var zlib = require('zlib');
var input = '..................text................';
zlib.deflate(input, function(err, buffer) {
	if (!err) {
		console.log("deflate (%s): ", buffer.length, buffer.toString('base64'));
		zlib.inflate(buffer, function(err, buffer) {
			if (!err) {
				console.log("inflate (%s): ", buffer.length, buffer.toString());
			}
		});
		zlib.unzip(buffer, function(err, buffer) {
			if (!err) {
				console.log("unzip deflate (%s): ", buffer.length, buffer.toString());
			}
		});
	}
});

zlib.deflateRaw(input, function(err, buffer) {
	if (!err) {
		console.log("deflateRaw (%s): ", buffer.length, buffer.toString('base64'));
		zlib.inflateRaw(buffer, function(err, buffer) {
			if (!err) {
				console.log("inflateRaw (%s): ", buffer.length, buffer.toString());
			}
		});
	}
});

zlib.gzip(input, function(err, buffer) {
	if (!err) {
		console.log("gzip (%s): ", buffer.length, buffer.toString('base64'));
		zlib.gunzip(buffer, function(err, buffer) {
			if (!err) {
				console.log("gunzip (%s): ", buffer.length, buffer.toString());
			}
		});
		zlib.unzip(buffer, function(err, buffer) {
			if (!err) {
				console.log("unzip gzip (%s): ", buffer.length, buffer.toString());
			}
		});
	}
});
```
输出：  
```
$ node zlib_buffers.js
deflate (17):  eJzT00MHJakVJehiAJizB+I=
deflateRaw (11):  09NDByWpFSXoYgA=
gzip (29):  H4sIAAAAAAAACtPTQwclqRUl6GIAandyAiYAAAA=
inflate (38):  ..................text................
unzip deflate (38):  ..................text................
inflateRaw (38):  ..................text................
gunzip (38):  ..................text................
unzip gzip (38):  ..................text................
```

### 5.2.4 压缩/解压缩流  
对流操作使用 pipe() 函数，用过压缩/解压缩对象把数据从一个流输送到另一个流。 适用于把任何 Readable 数据压缩成 
Writable 流。  
示例使用 fs.ReadStream 和 fs.WriteStream 压缩文件内容，通过使用 xlib.Gzip() 对象压缩一个文件的内容，然后
用 zlib.Gunzip() 对象对它解压缩。注意，在试图解压缩文件，以允许数据被刷新到磁盘之前，有 3 秒的超时时间延迟。  
```
// 使用 Zlib 模块压缩/解压缩文件流
var zlib = require("zlib");
var gzip = zlib.createGzip();
var fs = require('fs');
var inFile = fs.createReadStream('zlib_file.js');
var outFile = fs.createWriteStream('zlib_file.gz');
inFile.pipe(gzip).pipe(outFile);
setTimeout(function(){
	var gunzip = zlib.createUnzip({flush: zlib.Z_FULL_FLUSH});
	var inFile = fs.createReadStream('zlib_file.gz');
	var outFile = fs.createWriteStream('zlib_file.unzipped');
	inFile.pipe(gunzip).pipe(outFile);
}, 3000);
```














