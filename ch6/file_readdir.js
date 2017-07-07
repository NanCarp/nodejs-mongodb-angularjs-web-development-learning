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