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