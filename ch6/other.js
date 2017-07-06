fs.open("myFile", 'w', function(err, fd) {
	if (!err) {
		fs.close(fd);
	}
});

var fd = fs.openSync("myFile", 'w');
fs.closeSync(fd);