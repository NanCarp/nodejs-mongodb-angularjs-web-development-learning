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

下面





















