// 解析一个 URL 字符串转换成一个对象，然后将其转换回字符串的例子
var url = require('url');
var urlStr = 'http://user:pass@host.com:80/resource/path?query=string#hash';
var urlObj = url.parse(urlStr, true, false);
urlString = url.format(urlObj);

// 把一个 URL 解析到新位置
var url = require('url');
var originalUrl = 'http://user:pass@host.com:80/resource/path?query=string#hash';
var newResource = '/another/path?querynew';
console.log(url.resolve(originalUrl, newResource));

// 使用 parse() 解析查询字符串
var qstring = require('querystring');
var params = qstring.parse("name=Brad&color=red&color=blue");
console.log(params);

// 实现 ClientRequest 对象
var http = require('http');
var options = {
    hostname = 'www.myserver.com',
    path: '/',
    port: '8080',
    method: 'POST'
};
var req = http.request(options, function(response) {
    var str = '';
    response.on('data', function (chunk) {
        str += chunk;
    });
    response.on('end', function () {
        console.log(str);
    });
});
req.end();

// 启动 HTTP 服务，监听端口 8080
var http = require('http');
http.createSever(function (req, res) {
    
}).listen(8080);

var options = {
    key: fs.readFileSync('test/keys/client.pem'),
    cert: fs.readfileSync('test/keys/client.crt'),
    agent: false
};
options.agent = new https.Agent(options);
var options = {
    hostname: 'encrypted.mysite.com',
    port: 443,
    path: '/',
    method: 'GET',
    key: fs.readFileSync('test/keys/client.pem'),
    cert: fs.readFileSync('test/keys/client.crt),
    agent:false
};
var req = https.request(options, function(res) {
    
});













