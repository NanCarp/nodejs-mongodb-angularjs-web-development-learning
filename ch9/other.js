process.stdin.on('data', function (data) {
    console.log("Console Input: " + data);
});

process.on('SIGBREAK', function () {
    console.log("Got a SIGBREAK");
});