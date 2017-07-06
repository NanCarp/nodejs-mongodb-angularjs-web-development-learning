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