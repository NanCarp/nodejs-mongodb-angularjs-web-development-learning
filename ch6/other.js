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

fs.unlink("new.txt", function(err) {
	console.log(err ? "File Deleted Failed" : "File Deleted");
});

fs.truncate("log.txt", function(err) {
	console.log(err ? "File Truncate Failed" : "File Truncated");
});

fs.mkdir("./data", function(err) {
	fs.mkdir("./data/folderA", function(err) {
		fs.mkdir("./data/folderA/folderB", function(err) {
			fs.mkdir("./data/folderA/folderB/folderD", function(err) {
				
			});
		});
		fs.mkdir("./data/folderA/folderC", function(err) {
			fs.mkdir("./data/folderA/folderC/folderE", function(err) {
				
			});
		});
	});
});

fs.rmdir("./data/folderA/folderB/folderC", function(err){
	fs.rmdir("./data/folderA/folderB", function(err) {
		fs.rmdir("./data/folderD", function(err) {
			
		});
	});
	fs.rmdir("./data/folderA/folderC", function(err) {
		fs.rmdir("./data/folderE", function(err) {
			
		});
	});
});

fs.rename("old.txt", "new.txt", function(err) {
	console.log(err ? "Rename Failed" : "File Renamed");
});

fs.rename("testDir", "renameDir", function(err) {
	console.log(err ? "Rename Failed" : "Folder Renamed");
});

fs.watchFile("log.txt", {persistent:true, interval:5000}, function (curr, prev) {
    console.log("log.txt modified at: " + curr.mtime);
    console.log("Previous modification was: " + prev.mtime);
});









