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














