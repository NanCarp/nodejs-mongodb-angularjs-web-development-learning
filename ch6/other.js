fs.open("myFile", 'w', function(err, fd) {
	if (!err) {
		fs.close(fd);
	}
});

var fd = fs.openSync("myFile", 'w');
fs.closeSync(fd);

fs.exists('filesystem.js', function (exists) {
	console.log(exits ? "Path Exists" : "Path Does Not Exist");
}):