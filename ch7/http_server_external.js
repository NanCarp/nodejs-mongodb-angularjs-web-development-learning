// 实现远程连接到外部天气数据源的 HTTP Web 服务
var http = require('http');
var url = require('url');
var qstring = require('querystring');
// 完成响应，并将其返回客户端
function sendResponse(weatherData, res){
  var page = '<html><head><title>External Example</title></head>' +
    '<body>' +
    '<form method="post">' +
    'City: <input name="city"><br>' +
    '<input type="submit" value="Get Weather">' +
    '</form>';
  if(weatherData){
    page += '<h1>Weather Info</h1><p>' + weatherData +'</p>';
  }
  page += '</body></html>';    
  res.end(page);
}
// 读取响应并把数据传递到 sendResponse() 函数
function parseWeather(weatherResponse, res) {
  var weatherData = '';
  weatherResponse.on('data', function (chunk) {
    weatherData += chunk;
  });
  weatherResponse.on('end', function () {
    sendResponse(weatherData, res);
  });
}
// 实现对 openweathermap.org 的客户端请求
function getWeather(city, res){
  var options = {
    host: 'http://samples.openweathermap.org',
    path: '/data/2.5/weather?q=' + city
  };
  http.request(options, function(weatherResponse){
    parseWeather(weatherResponse, res);
  }).end();
}
// 实现 Web 服务器
http.createServer(function (req, res) {
  console.log(req.method);
  if (req.method == "POST"){
    var reqData = '';
    req.on('data', function (chunk) {
      reqData += chunk;
    });
    req.on('end', function() {
      var postParams = qstring.parse(reqData);
      getWeather(postParams.city, res);
    });
  } else{
    sendResponse(null, res);
  }
}).listen(8080);