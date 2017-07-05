var accountStr = '{"name":"Jedi", "members":["Yoda","Obi Wan"], \
				   "number":34512, "location": "A galaxy far, far away"}';
var accountObj = JSON.parse(accountStr);
console.log(accountObj.name);
console.log(accountObj.members);

var accountObj = {
	name: "Baggins",
	number: 10645,
	numbers: ["Frodo, Bilbo"],
	location: "Shire"
};
var accountStr = JSON.stringify(accountObj);
console.log(accountStr);

new Buffer(sizeInBytes)
new Buffer(octetArray)
new Buffer(string, [encodeing])

var buf256 = new Buffer(256);
var bufOctets = new Buffer([0x6f, 0x63, 0x74, 0x65, 0x74, 0x73]);
var bufUTF8 = new Buffer("Some UTF Text \uoob6 \u30c6 \u20ac", 'utf8');

“UTF8 text \u00b6".length;
// 计算结果是 11
BUffer.byteLength("UTF8 text \u00b6", 'utf8');
// 计算结果是 12
Buffer("UTF8 text \u00b6").length;
// 计算结果是 12