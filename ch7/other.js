// ��һ�� URL ��������λ��
var url = require('url');
var originalUrl = 'http://user:pass@host.com:80/resource/path?query=string#hash';
var newResource = '/another/path?querynew';
console.log(url.resolve(originalUrl, newResource));

// ʹ�� parse() ������ѯ�ַ���
var qstring = require('querystring');
var params = qstring.parse("name=Brad&color=red&color=blue");
console.log(params);

// ʵ�� ClientRequest ����
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

// ���� HTTP ���񣬼����˿� 8080
var http = require('http');
http.createSever(function (req, res) {
    
}).listen(8080);