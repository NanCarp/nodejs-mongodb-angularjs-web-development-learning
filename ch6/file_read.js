// ��ȡ JSON �ַ����ļ���һ������
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