// 使用 POST 发送 JSON 数据到服务器，
// 并处理 JSON 响应的基本 HTTP 客户端
var http = require('http');
var options = {
    host: '127.0.0.1',
    path: '/',
    port: '8080',
    method: 'POST'
};
function readJSONResponse(response) {
    var responseData = '';
	// 读取 JSON 响应
    response.on('data', function (chunk) {
        responseData += chunk;
    });
	// 把响应解析成一个 JSON 对象，并输出原始响应、消息、问题
    response.on('end', function () {
        var dataObj = JSON.parse(responseData);
        console.log("Raw Response: " + responseData);
        console.log("Message: " + dataObj.message);
        console.log("Question: " + dataObj.question);
    });
}
// 请求开始
var req = http.request(options, readJSONResponse);
// 把 JSON 字符串写入请求流
req.write('{"name":"Bilbo", "occupation":"Burglar"}');
// 完成请求
req.end();