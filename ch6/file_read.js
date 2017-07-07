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