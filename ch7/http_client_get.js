// 针对 GET Web 服务器发出 GET 请求的基本 Web 客户端
var http = require('http');
var options = {
    hostname: 'localhost',
    port: '8080',
};
function handleResponse(response) {
    var serverData = '';
    response.on('data', function (chunk) {
        serverData += chunk;
    });
    response.on('end', function () {
		// 记录响应的 StatusCode 
        console.log("Response Status:", response.statusCode);
		// 记录响应的 headers
        console.log("Response Headers:", response.headers);
		// 记录完整的服务器响应
        console.log(serverData);
    });
}
http.request(options, function(response) {
    handleResponse(response);
}).end();