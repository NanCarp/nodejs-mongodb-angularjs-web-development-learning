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



















