---
title: 在 Node.js 中使用多处理器扩展应用程序
date: 2017-07-31 21:40:47
tags: Node.js MongoDB AngularJS Web 学习
---

### 9.1.1 了解 I/O 管道  
process 模块为进程 stdin、stdout 和 stderr 提供了对标准 I/O 管道的访问。stdin 是进程的标准输入管道，它通常是
控制台。可以用以下代码读取控制台输入：  
```
process.stdin.on('data', function (data) {
    console.log("Console Input: " + data);
});
```
向控制台输入数据，再按 Enter 键，数据回写。例如：  
```
some data
Console Input: Some data
```
process 模块的 stdout 和 stderr 属性是可以相应地处理的 Writable 流。  

### 9.1.2 了解进程的信号  
process 模块允许注册监听器来处理操作系统发给一个进程的信号。当你需要在一个进程停止或终止前执行某些动作，例如
执行清理操作时，这很有用。  
注册一个进程信号，使用 on(event, callback) 方法。例如，要为 SIGBREAK 事件注册一个事件处理程序：  
```
process.on('SIGBREAK', function () {
    console.log("Got a SIGBREAK");
});
```

### 9.1.3 使用 process 模块控制进程执行  
process 模块能够对进程的执行施加一定的控制。特别是，它使你能够停止当前进程，杀掉另一个进程，货安排工作在事件
队列中运行。例如，退出当前 Node.js 进程：  
`process.exit(0)`  

### 9.1.4 从 process 模块获取信息  
process 模块有丰富的与正在运行的进程和系统体系结构相关的信息。例如，process.pid 属性提供了随后可以让应用程序
使用得进程 ID。  
下面进行了一系列的调用，并把结果输出到控制台：  
```
var util = require('util');
console.log('Current directory: ' + process.cwd());
console.log('Environment Settings： ' + JSON.stringify(process.env));
console.log('Node Args: ' + process.argv);
console.log('Execution Path: ' + process.execPath);
console.log('Execution Args: ' + JSON.stringify(process.execArgv));
console.log('Node Version: ' + process.version);
console.log('Module Versions: ' + JSON.stringify(process.versions));
//console.log(process.config);
console.log('Process ID: ' + process.pid);
console.log('Process Title: ' + process.title);
console.log('Process Platform: ' + process.platform);
console.log('Process Architecture: ' + process.arch);
console.log('Memory Usage: ' + util.inspect(process.memoryUsage()));
var start = process.hrtime();
setTimeout(function () {
    var delta = process.hrtime(start);
    console.log('High-Res timer took %d seconds and %d nanoseconds', delta[0], delta[1]);
    console.log('Node has been running %d seconds', process.uptime());
}, 1000);
```

## 9.2 实现子进程  
若要使 Node.js 应用程序能利用服务器的多处理器的优势，就需要把工作分包给子进程。child_process 模块可以在其他
进程上产生、派生，并执行工作。  
**注意：**  
子进程不能直接访问彼此或父进程中的全局内存。因此，需要设计自己的应用程序以并行运行。  

### 9.2.1 了解 ChildProcess 对象  
child_process 模块提供了一个 ChildProcess 的新类，它作为可以从父进程访问的子进程的表示形式。这使你可以从启动
子进程的父进程控制、结束，并将消息发送到子进程。  
process 模块也是一个 ChildProcess 对象。这意味着，当你从父模块访问 process 时，它是父 ChildProcess 对象；但
是当你从子进程访问 process 时，它是 ChildProcess 对象。  

### 9.2.2 使用 exec() 在另一个进程上执行一个系统命令  
从一个 Node.js 进程中把工作添加到另一个进程的最简单方法是使用 exec() 函数在一个子 shell 中执行系统命令。  
执行时，exec() 函数创建一个系统子 shell，然后在那个 shell 中执行命令字符串，就好像你已经从一个控制台提示符下
执行它。  
exec() 函数返回一个 ChildProcess 对象，语法：  
`child_process.exec(command, [options], callback)`   
- command：字符串，指定在子 shell 中执行的命令。
- options：一个对象，指定执行命令时使用得设置。
- callback：
    - error：传递错误对象
    - stdout、stderr：都是包含执行命令的输出的 Buffer 对象。

下面使用 exec() 函数执行一个系统命令：  
```
/**
 * Created by nanca on 8/1/2017.
 */
var childProcess = require('child_process');
var options = {maxBuffer: 100 * 1024, encoding: 'utf8', timeout: 5000};
var child = childProcess.exec('dir /B', options, function (error, stdout, stderr) {
    if (error) {
        console.log(error.stack);
        console.log('Error Code: ' + error.code);
        console.log('Error Signal: ' + error.signal);
    }
    console.log('Results: \n' + stdout);
    if (stderr.length) {
        console.log('Errors: ' + stderr);
    }
});
child.on('exit', function (code) {
    console.log('Completed with code: ' + code);
})
```












