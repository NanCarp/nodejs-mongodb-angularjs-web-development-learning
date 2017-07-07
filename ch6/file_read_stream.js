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