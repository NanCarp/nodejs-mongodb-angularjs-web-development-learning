// 实现一个处理 HTTP POST 请求的基本 HTTP 服务器
var http = require('http');
http.createServer(function (req, res) {
	// 从请求流中读取数据
    var jsonData = "";
    req.on('data', function (chunk) {
        jsonData += chunk;
    });
	// 事件处理程序，该数据被转换为一个对象，并建立
	// 具有 message 和 question 属性的新对象
    req.on('end', function () {
        var reqObj = JSON.parse(jsonData);
        var resObj = {
            message: "Hello " + reqObj.name,
            question: "Are you a good " + reqObj.occupation + "?"
        };
        res.writeHead(200);
		// 响应 JSON 字符串被转化为一个对象
        res.end(JSON.stringify(resObj));
    });
}).listen(8080);


var http = require('http');
var options = {
    host: '127.0.0.1',
    path: '/',
    port: '8080',
    method: 'POST'
};
function readJSONResponse(response) {
    var responseData = '';
    response.on('data', function (chunk) {
        responseData += chunk;
    });
    response.on('end', function () {
        var dataObj = JSON.parse(responseData);
        console.log("Raw Response: " + responseData);
        console.log("Message: " + dataObj.message);
        console.log("Question: " + dataObj.question);
    });
}
var req = http.request(options, readJSONResponse);
req.write('{"name":"Bilbo", "occupation":"Burglar"}');
req.end();
