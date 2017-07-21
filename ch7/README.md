---
title: 在 Node.js 中实现 HTTP 服务
date: 2017-07-10 21:26:44
tags: Node.js MongoDB AngularJS Web 学习
---

## 7.1 处理 URL  
统一资源定位符（URL）充当 HTTP 服务器用来处理来自客户端的请求的一个地址标签。它为把一个请求发到正确的服务器的
特定端口上，并访问合适的数据提供了所需要的信息。下图显示了 URL 及其可以被包括的组件的基本结构。

### 7.1.1 了解 URL 对象
要从一个 URL 字符串创建 URL 对象，把 URL 字符串作为第一个参数传递给下面的方法：  
`url.parse(urlStr, [parseQueryString], [slashedDenotedHost])`  
url.parse() 方法将 URL 字符串作为第一个参数。parseQueryString 参数是一个布尔值：如果为 true，那么也把 URL 的
查询字符串部分解析为字面量。它的默认值为 false。slashedDenotedHost 也是一个布尔值：如果为 true，那么把格式
为 //host/path 的 URL 解析为 {host: 'host', pathname: '/path'}，而不是 {pathname: '//host/path'}。它的
默认值为 false。  
还可以用 url.format() 方法将一个 URL 对象转换成字符串的形式：  
`url.format(urlObj)`  
由 url.parse() 创建的 URL 对象的属性：  
- href：这是租出解析的完整的 URL 字符串  
- protocol：请求协议，小写  
- host：URL 的完整主机部分，包括端口信息，小写
- auth：URL 的身份认证信息部分  
- hostname： 主机的主机名部分，小写  
- port：主机的端口号部分
- pathname：URL 的路径部分（包括最初的斜线，如果存在的话）
- search：URL 的查询字符串部分，包括前导的问号
- path：完整路径，包括路径和搜索
- query：要么是查询字符串中的参数部分，要么是含有查询字符串参数和值得解析后的对象，如果 parseQueryString 设置
为 true，就是解析后的对象
- hash：URL 的散列部分，包括井号（#）

以下是解析一个 URL 字符串转换成一个对象，然后将其转换回字符串的例子：  
```
var url = require('url');
var urlStr = 'http://user:pass@host.com:80/resource/path?query=string#hash';
var urlObj = url.parse(urlStr, true, false);
urlString = url.format(urlObj);
```

### 7.1.2 解析 URL 组件  
url 模块有可以用与浏览器相同的方式来解析 URL 的组件。这可以在服务器端操作 URL 字符串，以在 URL 中做出调整。
例如，你可能想要在处理一个请求之前更改 URL 的位置，因为该资源已经移动或更改了参数。  
要把一个 URL 解析到新的位置，可以使用以下语法：  
`url.resolve(from, to)`  
- from：指定原始基础基础 URL 字符串
- to：指定想要 URL 被解析到的新位置

下面代码把 URL 解析到新位置：  
```
var url = require('url');
var originalUrl = 'http://user:pass@host.com:80/resource/path?query=string#hash';
var newResource = '/another/path?querynew';
console.log(url.resolve(originalUrl, newResource));
```
输出：  
`http://user:pass@host.com:80/another/path?querynew`  
其注意，在被解析后的 URL 位置中只有资源路径及以后的内容会被改变。

### 7.2 处理查询字符串和表单擦书  
HTTP 请求通常在 URL 中包含查询字符串或在正文内包含参数数据来处理表单的提交。查询字符串可以从 7.1 节中定义的
URL 对象获得。由表单请求发送的参数数据可以从客户端请求的正文读出。  
查询字符串和表单参数都只是基本的键/值对。要在 Node.js 服务器中实际使用这些值，需要使用 querystring 模块的
parse() 方法将字符串转换成 JavaScript 对象：  
`querystring.parse(str, [sep], [eq], [options])`  
- str 参数是查询或参数字符串。
- sep 参数允许你指定使用得分隔符，默认的分隔符是 &。
- options 参数是一个具有属性 maxKeys 的对象，它让你能够限制生成的对象可以包含的键的数量，默认值是 1000。如果
指定为 0，则表示没有任何限制。

parse() 解析查询字符串的例子：  
```
var qstring = require('querystring');
var params = qstring.parse("name=Brad&color=red&color=blue");
console.log(params);
```
可以反过来使用 stringify() 函数把一个对象转换成一个查询字符串：  
`querystring.stringify(obj, [sep], [eq])`

## 7.3 了解请求、响应和服务器对象  
### 7.3.1 http.ClientRequest 对象  
当构建一个 HTTP 客户端时，调用 http.request() 使得一个 ClientRequest 对象在内部被创建。这个对象是为了当该
请求在服务器上进展的时候来表示它。使用 ClientRequest 对象来启动。监控和处理来自服务器的响应。  
ClientRequest 对象实现了一个 Writable 流，所以它提供了一个 Writable 流对象的所有功能。例如，可以使用 write() 方法写入 ClientRequest 对象以及把一个 Readable 流用管道传输到它里面去。  
来实现 ClientRequest 对象，以下语法：  
`http.request(option, callback)`  
- options：一个对象，其属性定义了如何把客户端的 HTTP 请求打开并发送到服务器。
- callback：回调函数，在把请求发送到服务器后，要处理从服务器返回的响应时调用此函数。唯一的参数是一个 
IncomingMessage 对象，该对象是来自服务器的响应。  

下面代码显示了 ClientRequest 对象的基本实现：  
```
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
```
在创建 ClientRequest 对象时，可以指定的选项  
- host：请求发往的服务器的域名或 IP 地址，默认为 localhost
- hostname：与 host 相同，但对 url.parse() 的支持由于 host
- port：远程服务器的端口，默认为 80
- localAddress：网络连接绑定的本地接口
- socketPath：Unix 域套接字（使用 host:port 或 socketPath）
- method：指定 HTTP 请求方法的字符串。例如，GET、POST、CONNECT、OPTIONS 等。默认为 GET
- path：指定所请求的资源路径的字符串。默认为/。这也应该包含查询字符串（如果有）。例如：/book.html?chapter=12
- headers：包含请求标头的对象。例如：{'content-length': '750'， 'content-type': 'text/plain'}s
- auth：基本身份验证，形式：user:password，用于计算 Authorization 头。
    - undefined（默认值）：使用全局 Agent
    - Agent：使用特定 Agent 对象
    - false：禁用 Agent 行为
    
ClientRequest 对象提供的时间：  
- response：当服务器接收到该请求的响应时发出，该回调处理程序接受一个 IncomingMessage 对象最为唯一的参数
- socket：当一个套接字被分配给该请求后发出。如果该事件未由客户端处理，那么该连接将被关闭
- upgrade：当服务器响应在其标头包括一个更新的请求时发出
- continue：当服务器发送一个 100 Continue HTTP 响应，指示客户端发送请求正文时发出

适用于 ClientRequest 对象的方法  
- write(chunk, [encoding])：把一个正文数据块（Buffer 或 String 对象）写入请求，这可以让你的数据流入 
ClientRequest 对象的 Writable 流。如果传输正文数据，则当创建请求时应该包括 {'Transter-Encoding', 'chunked}
标头选项。编码默认参数为 utf8
- end([data], [encoding])：把可选的数据写入请求正文，然后刷新 Writable 流并终止该请求
- abort()：终止当前的请求
- setTimeout(timeout, [callback]) 为请求设置套接字超时时间
- setNoDeploy([noDelay])：禁用在发送数据之前缓冲数据的 Nagle 算法。noDelay 参数是一个布尔值，为 true 表
示立即写，为 false 表示缓冲写入
- setSocketKeepAlive([enable], [initialDelay])：启用和禁用对客户机请求的保持活动功能。enable 参数默认
为 false，即禁用。initialDelay 参数指定最后一个数据包和第一个保持活动请求之间的延迟

### 7.3.2 http.ServerResponse 对象  
当 HTTP 服务器接收到一个 request（请求）事件时，它在内部创建一个 ServerResponse 对象。这个对象作为第二个参数
被传递到 request（请求）事件处理程序。可以使用 ServerRequest 对象制定并发送到客户端的响应。  
ServerResponse 对象实现了一个 Writable 流，所以它提供了一个 Writable 流对象的所有功能。例如，你可以使用 
write() 方法写入 ServerResponse 对象，也可以用管道把 Readable 流传入它以把数据写回客户端。  
处理客户端请求时，使用属性、事件和 ServerResponse 对象的方法来建立和发送标头、写入数据，以及发送响应。  
  
ServerResponse 对象提供的事件和属性  
- close：当到客户端的连接在发送 Response.End() 来完成并刷新响应之前关闭时发出
- headersSent：布尔值：如果标头已被发送，为 true；否则为 false。这是只读的
- sendDate：布尔值：如果设置为 true，则 Date 标头是自动生成的，并作为响应的一部分发送
- statusCode：让你无须显式地写入标头来指定响应状态码。例如：response.statusCode=500

适用于 ServerResponse 对象的方法  
- writeContinue()：发送一个 HTTP/ 1.1 100 Continue 消息给客户端，请求被发送的正文内容
- writeHead(statusCode, [reasonPhrase], [headers])：把一个响应写入请求。StatusCode 参数是 3 位数的
HTTP 响应状态代码，如 200、401，或 500。可选的 reasonPhrase 是一个字符串，表示 StatusCode 的原因，headers 
是响应标头对象，例如：
    ```
    response.writeHead(200, 'Success', {
        'Content-Length': body.length,
        'Content-type': 'text/plain'
    });
    ```
- setTimeout(msecs, callback)：设置客户端连接的套接字超时时间，以毫秒计，带有一个如果发生超时时将被执行的
回调函数
- setHeader(name, value)：设置一个特定的标头值，其中 name 是 HTTP 标头的名称，而 value 是标头的值
- getHeader(name)：获取已在响应中设置的一个 HTTP 标头的值
- removeHeader(name)：移除已在响应中设置的一个 HTTP 标头
- write(chunk, [encoding])： 写入 chunk、buffer 或 String 对象到响应 Writable 流。这仅把数据写入响应的
正文部分。默认编码为 uft8。如果数据被成功写入，返回 true；否则，如果数据被写入到用户内存，则返回 false，如果
返回 false，当缓冲区再次空闲时 drain 事件将由 Writable 流发出
- addTrailers(headers)：将 HTTP 尾随标头写入响应的结束处
- end([data], [encoding])：将可选的数据输出写入响应的正文，然后刷新 Writable 流并完成响应

### 7.3.3 http.IncomingMessage 对象  
无论是 HTTP 服务器还是 HTTP 客户端都创建 IncomingMessage 对象。服务器端的客户端请求或客户端的服务器响应都可以
由 IncomingMessage 对象表示，因为它们的功能基本相同。  
该 IncomingMessage 对象实现了 Readable 流，能够把客户端请求或服务器响应作为流源读入。可以监听 readable 和 
data 事件，从流中读取数据。  
ServerResponse 对象中可用的事件、属性和方法  
- close：当底层套接字被关闭时发出
- httpVersion：指定用于构建客户端请求/响应的 HTTP 版本
- headers：包含了随请求/回应发送的标头的一个对象
- trailers：包含了随请求/响应发送的任何 trailer 标头的对象
- method：指定用于请求/响应的方法（例如，GET、POST 或 CONNECT）
- url：发送到服务器的 URL 字符串，这是可以传送到 url.parse() 的字符串。这个属性只在处理客户端请求的 HTTP 服务
中有效
- statusCode：指定来自服务器的 3 位数状态码。此属性只在处理客户端响应的 HTTP 服务中有效
- socket：这是一个指向 net.Socket 对象的句柄，用来与客户端/服务器通信
- setTimeout(msecs, callback)：设置连接的超时时间，以毫秒为单位，以及发生超时时执行的回调函数

### 7.3.4 HTTP Server 对象  
Node.js Server 对象提供了实现 HTTP 服务器的基本框架。它提供了一个监听端口的底层套接字和接收请求，然后发送
响应给客户端连接的处理程序。当服务器正在监听时，Node.js 应用程序没有结束。  
Server 对象实现 EventEmitter 并且发出如下面列出的事件。实现一个 HTTP 服务器时，需要处理这些事件中的至少某些
或全部。例如，当收到客户端请求时，至少需要一个事件处理程序来处理所发生的 request 事件。  
可以被 Server 对象触发的事件：  
- request：每当服务器收到客户端请求时触发，回调函数接收两个参数。第一个是代表客户端请求的 IncomingMessage 对象，
第二个是用来制定和发送响应的 ServerResponse 对象。例如：function callback (request, response) {}
- connection：当一个新的 TCP 流建立时触发。回调函数接收套接字作为唯一的参数。例如：
function callback(socket) {}
- close：服务器关闭时触发，回调函数不接收参数
- checkContinue：当收到包括期待的 100-continue 标头的请求时触发。即使不处理此事件，默认的事件处理程序也响应 
HTTP/1.1 100 Continue。例如：function callback(request, response) {}
- connect：接收到 HTTP CONNECT 请求时发出。callback 接收 request、socket、以及 head，它是一个包含隧道流的
第一个包的缓冲区。例如：function callback(request, socket, head) {}
- upgrage：当客户端请求 HTTP 升级时发出。如果不处理这个事件，则客户端发送一个升级请求来把自己的连接关闭。
callback 接收 request、socket、以及 head，它是一个包含隧道流的第一个包的缓冲区。
例如：function callback(request, socket, head) {}
- clientError：当客户端连接套接字发出一个错误时发出。callback 接收 error 作为第一个参数，并接收 socket 作
为第二个参数。例如：function callback (errorm socket) {}

启动 HTTP 服务器，首先使用 createServer() 创建 Server 对象：  
`http.createServer([requestListener])`  
此方法返回 Server 对象，可选的 requestListener 参数是在请求事件被触发时执行的回调函数。其接收两个参数：代表
客户端请求的 IncomingMessage 对象，制定和发送响应的 ServerResponse 对象。  
一旦创建 Server 对象，可以调用 Server 对象的 listen() 方法开始监听它：  
`listen(port, [hostname], [nacklog], [callback])`  

常用方法：
- port（端口）：指定监听的福安口。
- hostname（主机名）：当主机名将接收连接时指定。如果省略，服务器接受直接指向任何 IPv4 地址（INADDR_ANY）的
连接。
- backlog（挤压）：指定被允许进行排队的最大待处理连接数。默认值 511。
- callback（回调）：指定该服务器已经开始在指定的端口上监听时，要执行的回调处理程序。

下面显示，启动一个 HTTP 服务器并监听端口 8080。注意，请求回调处理函数被传递到 createServer() 方法中：  
```
var http = require('http');
http.createSever(function (req, res) {
    
}).listen(8080);
```
可以使用另外两种方法监听通过文件系统的连接：  
```
listen(path, [callback]) // 接受一个要监听的文件路径
listen(handle, [callback]) // 接受一个已经打开的文件描述符句柄
```
停止监听：  
`close([callback])`  

## 7.4 在 Node.js 中实现 HTTP 客户端和服务器  
### 7.4.1 提供静态文件服务  
为了在 Node.js 中提供静态文件服务，需要先启动 HTTP 服务器并监听端口。然后，在请求处理程序中，需要使用 fs 模块
在本地打开该文件，然后在响应中写入文件的内容。  
下面显示静态文件服务器的基本实现。createServer() 创建服务器，listen() 在 Server 对象上监听 8080 端口。
url.parse() 方法解析 URL，pathname（路径名）指定文件路径。静态文件使用 fs.readFile() 被打开和读取，并在 
readFile() 回调函数中，使用 res.end(data) 把该文件的内容写入响应对象。  
```
// 实现一个基本的静态文件服务的 Web 服务器
var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html/";
http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true, false);
    fs.readFile(ROOT_DIR + urlObj.pathname, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
}).listen(8080);
```
打开浏览器，输入 URL localhost:8080。  
下面显示了一个 HTTP 客户端的基本实现，它向服务器发送一个 GET 请求来检索文件内容。当请求完成时，回调函数使用 
on('data') 处理程序来读取来自服务器的响应中的内容，然后 on('end') 处理程序来吧文件内容记录到一个文件。  
```
// 一个基本的 Web 客户端检索静态文件
var http = require('http');
var options = {
    hostname: 'localhost',
    port: '8080',
    path: '/hello.html'
};
function handleResponse(response) {
    var serverData = '';
    response.on('data', function (chunk) {
        serverData += chunk;
    });
    response.on('end', function () {
        console.log(serverData);
    });
}
http.request(options, function(response) {
    handleResponse(response);
}).end();
```
输出：  
客户端：  
```
<html>
  <head>
    <title>Static Example</title>
  </head>
  <body>
    <h1>Hello from a Static File</h1>
  </body>
</html>
```
浏览器，输入 localhost:8080/hello.html：  
`Hello from a Static File`  

### 7.4.2 实现动态的 GET 服务器  
下面实现了一个动态 Web 服务器。Web 服务器简单地用一个动态生成的 HTTP 文件来响应。该例旨在显示发送标头，建立
响应，然后在一系列 write() 请求中发送数据的过程。在请求事件处理程序中，Content-Type 标头被设置，然后标头随同
响应代码 200 被发送。在现实中，将会做很多处理来准备数据。本例中，数据只是定义的消息数组。循环遍历这些消息并
每次调用 write() 把响应传送到客户端。响应通过对 end() 的调用被完成。  
```
// 实现基本的 GET Web 服务器
var http = require('http');
var messages = [
    'Hello World',
    'From a basic Node.js server',
    'Take Luck'];
http.createServer(function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.write('<html><head><title>Simple HTTP Server</title></head>');
    res.write('<body');
    for (var idx in messages) {
        res.write('\n<h1.' + messages[idx] + '</h1>');
    }
    res.end('\n</body></html>');
}).listen(8080);
```
下面显示了从 GET Web 服务器读取响应的 HTTP 客户端的基本实现。注意，没有路径被指定（因为该服务并不真正需要
一个路径）。对于更复杂的服务，要实现查询字符串或复杂的路径的路由来处理各种调用。  
```
// 针对 GET Web 服务器发出 GET 请求的基本 Web 客户端
var http = require('http');
var options = {
    hostname: 'localhost',
    port: '8080,
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
```
输出：  
报错

### 7.4.3 实现 POST 服务器  
下面显示处理 POST 请求的动态 Web 服务的基本实现。本例中，Web 服务从客户端接收一个 JSON 字符串，它表示一个
具有 name 和 occupation 属性的对象。  
```
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
    port: '8888',
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
```
下面显示把 JSON 数据作为 POST 请求的一部分发送到服务器的 HTTP 客户端的基本实现。  
```
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
```
输出：  
```
Raw Response: {"message":"Hello Bilbo","question":"Are you a good Burglar?"}
Message: Hello Bilbo
Question: Are you a good Burglar?
```

### 7.4.4 与外部源交互  
下面显示同时接收 GET 和 POST 请求的 Web 服务器的实现。对于 GET 请求，返回带有表单的简单网页，它允许用户提交
一个城市的名字。然后在 POST 请求中，城市名称被访问，且 Node.js 客户端启动并远程连接到 openweathermap.org 检索
该城市的天气信息。之后这些信息连同原来的网页表单被一起返回到服务器。
```
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
```
输出：  
需要秘钥  

















