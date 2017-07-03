---
title: 在 Node.js 中使用事件、监听器、定时器和回调
date: 2017-06-28 21:31:29
tags: Node.js MongoDB AngularJS Web 学习
---

# 在 Node.js 中使用事件、监听器、定时器和回调  

### 4.2.1 实现定时器  
**用超时时间来延迟工作**  
超时定时器用于将工作延迟一个特定时间数量。当时间到了时，回调函数执行，而定时器会消失。对于只需要执行一次的工作，
应当使用超时时间。  
创建超时时间定时器使用 Node.js 中内置的 setTimeout(callback, delayMilliSeconds, [args]) 方法。当你调用 
setTimeout() 时，回调函数在 delayMilliSeconds 到期后执行。例如，下面的语句在 1 秒后执行 myFunc()：  
`setTimeout(myFunc, 1000)`  
setTimeout() 函数返回定时器对象的 ID，可以在 delayMilliSeconds 到期前任何时候把此 ID 传递给 clearTimeout(timeoutId)
来取消超时时间函数。  
例如：  
```
myTimeout = setTimeout(myFunc,, 100000);
...
clearTimeout(myTimeout);
```
以下代码实现了调用 simpleTimeout() 函数的一系列简单超时时间，它输出自从超时时间被安排后经历的毫秒数。请注意，
setTimeout() 的调用次序是无关紧要的。  
```
// simple_timer.js 在不同的时间间隔实现了一系列超时时间
function simpleTimeout(consoleTimer) {
	console.timeEnd(consoleTimer);
}
console.time("twoSecond");
setTimeout(simpleTimeout, 2000, "twoSecond");
console.time("oneSecond");
setTimeout(simpleTimeout, 1000, "oneSecond");
console.time("fiveSecond");
setTimeout(simpleTimeout, 5000, "fiveSecond");
console.time("50MilliSecond");
setTimeout(simpleTimeout, 50, "50MilliSecond");
```
下面结果按照其中的延时结束的顺序出现。  
```
$ node simple_timer.js
50MilliSecond: 51.578ms
oneSecond: 999.679ms
twoSecond: 2001.768ms
fiveSecond: 5000.161ms

```

**用时间间隔执行定期工作**  
时间间隔定时器用于按定期的延迟时间执行工作。当延时结束时，回调函数被执行，然后再次重新调度为改延迟时间，对于必须
定期进行的工作，你应该使用时间间隔。  
可以通过 Node,js 中内置的 setInterval(callback, delayMilliSeconds, [args]) 方法创建时间间隔计时器。当你调用 
setInterval() 时，么个 delayMilliSeconds 间隔到后，回调函数执行。例如，下面的语句每秒执行一次  myFunc()：  
`setInterval(myFunc, 1000);`  
setInterval() 函数返回定时器对象的 ID，你可以在 delayMilliSeconds 到期前把 ID 传递给 clearInterval(intervalId) 
来取消超时时间函数。例如：  
```
myInterval = setInterval(myFunc, 1000);
...
clearInterval(myInterval);
```
下面的代码实现了一系列在不同的时间间隔更新变量 x、y 和 z 值得简单时间间隔回调。  
```
// simple_interval.js 在不同的时间间隔实现了一系列的更新回调
var x=0, y=0, z=0;
function displayValue() {
	console.log("X=%d; Y=%d; Z=%d", x, y, z);
}
function updateX() {
	x += 1;
}
function updateY() {
	y += 1;
}
function updateZ() {
	z += 1;
	displayValue();
}
setInterval(updateX, 500);
setInterval(updateY, 1000);
setInterval(updateZ, 2000);
```
请注意 x、y 和 z 的值的改变不同，因为该时间间隔量是不同的；x 得递增速度是 y 的两倍，y 的递增速度又是 z 的两倍，
输出如下所示：    
```
$ node simple_interval.js
X=3; Y=1; Z=1
X=7; Y=3; Z=2
X=11; Y=5; Z=3
X=15; Y=7; Z=4
X=19; Y=9; Z=5
X=23; Y=11; Z=6
X=27; Y=13; Z=7
X=31; Y=15; Z=8
X=35; Y=17; Z=9
X=39; Y=19; Z=10
X=43; Y=21; Z=11
X=47; Y=23; Z=12
```
**使用及时计时器立即执行工作**  
即时计时器用来在 I/O 事件的回调函数开始执行后，但任何超时时间或时间间隔事件被执行之前，立刻执行工作。它们允许你
把工作调度为在事件队列中的当前事件完成之后执行。你应该使用即时定时器为其他回调产生长期运行的执行段，以防止 I/O 
事件饥饿。  
可以使用 Node.js 中内置的 setImmediate(callback, [args]) 方法创建即时计时器。当你调用 setImmediate() 时，
回调函数被放置在事件队列中，并在遍历事件队列循环的每次迭代中，在 I/O 有机会被调用后弹出一次。例如，下面的代码调度 
myFunc() 来在遍历事件队列的下一个周期内执行：  
`setimmediate(myFunc(), 1000);`  
setImmediate() 函数返回一个定时器对象的 ID，你可以在从事件队列提取出它前的任何时候把 ID 传递给 clearImmediate(
immediateId)。例如：  
```
myImmediate = setImmediate(myFunc);
...
clearImmediate(myImmediate);
```

**从事件循环中取消定时器引用**  
当定时器事件回调是留在事件队列中的仅有事件时，通常你不会希望它们继续被调度。setInterval 和 setTimeout 返回的对象
中的 unref() 函数，能在这些事件是队列中仅有的事件时，通知事件循环不要继续。  
例如，下面的代码取消 myInterval 时间间隔定时器引用：  
```
myInterval = setInterval(myFunc);
myInterval.unref();
```
如果以后由于某种原因，你不想在时间间隔函数是留在队列中的仅有事件时终止程序，就可以使用 ref() 函数来重新引用它：  
`myInterval.ref()`  
> **警告**  
> 当 unref() 与 setTimeout 定时器结合使用时，要用一个独立的定时器来唤醒时间循环。大量使用这些功能会对你
> 的代码性能产生不利影响，所以应该尽量少地创建它们。  

### 4.2.2 使用 nextTick 来调度工作  
在事件队列上调度工作的一个非常有用的方法是使用 process.nextTick(callback) 函数。此函数调度要在事件循环的下一次
循环中运行的工作。不像 setImmediate() 方法，nextTick() 在 I/O 事件被触发之前执行。这可能会导致 I/O 事件的饥饿，
所以 Node.js 通过默认值为 1000 的 process.maxTickDepth 来限制事件队列的每次循环可执行的 nextTick 事件的数目。  
下面的代码说明了使用阻塞 I/O 调用、定时器和 nextTick() 时，事件的顺序。  
```
// nexttick.js：实现了一系列阻塞 fs 调用，即时计时器和 nextTick() 调用来显示执行顺序
var fs = require("fs");
fs.stat("nexttick.js", function(err, stats) {
	if(stats) {
		console.log("nexttick.js Exists");
	}
});
setImmediate(function() {
	console.log("Immediate Timer 1 Executed");
});
setImmediate(function() {
	console.log("Immediate Timer 2 Executed");
});
process.nextTick(function() {
	console.log("Next Tick 1 Executed");
});
process.nextTick(function() {
	console.log("Next Tick 2 Executed");
});
```
输出如下，显示 nextTick() 调用先得到执行：  
```
$ node nexttick.js
Next Tick 1 Executed
Next Tick 2 Executed
Immediate Timer 1 Executed
Immediate Timer 2 Executed
nexttick.js Exists

```

### 4.2.3 实现事件发射器和监听器  
本节重点介绍创建自己的自定义事件，以及实现党一个事件被发出时执行的监听器回调。  
**将自定义事件添加到 JavaSript 对象**  
事件使用一个 EventEmitter 对象来发出。  
```
var events = require('events');
var emitter = new events.EventEmitter();
emitter.emit("simpleEvent');
```
直接把事件添加到 JavaScript 对象，需要通过在对象实例中调用 events.EventEmitter.call(this) 来在对象中继承 
EventEmitter 功能，还需要把 events.EventEmitter.prototype 添加到对象的原型中。例如：  
```
Function MyObj() {
    Events.EventEmitter.call(this);
}
MyObj.prototype.__proto__ = events.EventEmitter.prototype;

```
然后，就可以直接从对象实例中触发事件。例如：  
```
var myObj = new MyObj();
myObj.emit("someEvent"):
```

**把事件监听器添加到对象**  
一旦有了一个会发出事件的对象实例，就可以喂自己所关心的事件添加监听器。可以通过使用下面的功能之一把监听器添加到 
EventEmitter 对象。  
- **.addListener(eventName, callback)**：将回调函数附加到对象的监听器中。每当 eventName 事件被触发时，
回调函数就被放置在事件队列中执行。
- **.on(eventName, callback)**：同 .addListener()。
- **.once(eventName, callback)**：只有 eventName 事件第一次被触发时，回调函数才被放置在事件队列中执行。  

例如，要在前面定义的 MyObject EventEmitter 类的实例中增加一个监听器，可以使用如下代码：  
```
function myCallback() {
    ...
}
var myObject = new MyObj();
myObject.on("someEvent", myCallback);
```

**从对象中删除监听器**  
监听器会导致开销，只在必要时使用。Node.js 在 EventEmitter 对象上提供了多个辅助函数来管理监听器。  
- **.listener(eventName)：** 返回一个连接到 eventName 事件的监听器函数的数组。
- **.setMaxListeners(n)：** 如果多于 n 的监听器都加入到 EventEmitter 对象，就会触发警报。默认值 10。
- **.removeListener(eventName, callback)：** 将 callback 函数从 EventEmitter 对象的 eventName 事件中删除。  

**实现事件监听器和发射器事件**  
一下代码演示在 Node.js 实现监听器和自定义事件发射器的过程。Account 对象从 EventEmitter 类继承并提供了两种方法，即 
deposit（存款）和 withdraw（取款），它们都发射 balanceChanged 事件。然后，3 个回调函数的实现连接到 Account 对象
实例的 balanceChanged 事件并显示各种形式的数据。  
请注意，checkGoal(acc, goal) 回调函数的实现有点不同于其他回调函数。这说明了如何在事件被触发时，将变量传递到该事件
监听函数。  
```
// emitter_listener.js：创建一个自定义 EventEmitter 对象并实现当
// balanceChanged 事件被触发时所触发的 3 个监听器
var events = require('events');
function Account() {
	this.balance = 0;
	events.EventEmitter.call(this);
	this.deposit = function(amount) {
		this.balance += amount;
		this.emit('balanceChanged');
	};
	this.withdraw = function(amount) {
		this.balance -= amount;
		this.emit('balanceChanged');
	};
}
Account.prototype.__proto__ = events.EventEmitter.prototype;
function displayBalance(){
	console.log("Account balance: $%d", this.balance);
}
function checkOverdraw() {
	if (this.balance < 0) {
		console.log("Account overdrawn!!!");
	}
}
function checkGoal(acc, goal) {
	if (acc.balance > goal) {
		console.log("Goal Achieved!!!");
	}
}
var account = new Account();
account.on("balanceChanged", displayBalance);
account.on("balanceChanged", checkOverdraw);
account.on("balanceChanged", function() {
	checkGoal(this, 1000);
});
account.deposit(220);
account.deposit(320);
account.deposit(600);
account.withdraw(1200);
```
emitter_listener.js 的输出，显示了监听器回调函数输出的会计报表：    
```
$ node emitter_listener.js
Account balance: $220
Account balance: $540
Account balance: $1140
Goal Achieved!!!
Account balance: $-60
Account overdrawn!!!
```

## 4.3 实现回调  
### 4.3.1 向回调函数传递额外的参数  
大部分回调函数都有传递给它们的自动参数，如错误或结果缓冲区。使用回调时，常见的一个问题是如何从调用函数给它们传递额外
的参数。方法是在一个匿名函数中实现该参数，然后用来自匿名函数的参数调用回调函数。   
一下代码展示了如何实现回调函数的参数。有两个 sawCar 事件处理程序。请注意，sawCar 仅发出 make 参数。  
```
// callback_parameter.js 创建一个匿名函数来添加未由事件发出的附加参数
var events = require('events');
function CarShow() {
	events.EventEmitter.call(this);
	this.seeCar = function(make) {
		this.emit('sawCar', make);
	};
}
CarShow.prototype.__proto__ = events.EventEmitter.prototype;
var show = new CarShow();
function logCar(make) {
	console.log("Saw a " + make);
}
function logColorCar(make, color) {
	console.log("Saw a %s %s", color, make);
}
// 实现了 logCar(make) 回调处理程序
show.on("sawCar", logCar);
// 事件处理程序调用了一个匿名函数，随机选择的颜色被传递到 logColorCar(make, color) 调用
show.on("sawCar", function(make) {
	var colors = ['red', 'blue', 'black'];
	var color = colors[Math.floor(Math.random() * 3)];
	logColorCar(make, color);
});
show.seeCar("Ferrari");
show.seeCar("Porsche");
show.seeCar("Bugatti");
show.seeCar("Lamborghini");
show.seeCar("Aston Martin");
```
输出：  
```
$ node callback_parameter
Saw a Ferrari
Saw a blue Ferrari
Saw a Porsche
Saw a blue Porsche
Saw a Bugatti
Saw a blue Bugatti
Saw a Lamborghini
Saw a red Lamborghini
Saw a Aston Martin
Saw a black Aston Martin
```

### 4.3.2 在回调中实现闭包  
一个与异步回调的有趣问题是闭包。闭包（Closure） 是一个 JavaScript 的术语，它表示变量被绑定到一个函数的作用域，但
不绑定到它的父函数的作用域。当你执行一个异步回调时，父函数的作用域可能更改（例如，通过遍历列表并在每次迭代时改变值）。  
如果某个函数需要访问父函数的作用域的变量，就需要提供闭包，使这些值在回调函数从事件队列被提取出时可以得到。一个基本
方法是在函数块内部封装一个异步调用，并传入所需要的变量。  
下面代码说明了如何实现为 logCar() 异步函数提供闭包的包装器函数。循环 1 实现了一个基本的回调函数。然而，输出显示中，
汽车的名字始终是被读取的最后一个条目，因为每次循环迭代时， message 的值都会变化。  
循环 2 实现了把消息作为 msg 参数传递的包装器函数，而 msg 值被附着在回调函数上。因此，输出了正确的消息。为了使回调
真正异步，使用 process.nextTick() 方法来调度函数。  
```
// callback_closure.js：创建一个包装器函数来提供异步回调所需的变量的闭包
function logCar(logMsg, callback) {
	process.nextTick(function() {
		callback(logMsg);
	});
}
var cars = ["Ferrari", "Porsche", "Bugatti"];
// 循环 1，基本的回调函数
for (var idx in cars) {
	var message = "Saw a " + cars[idx];
	logCar(message, function() {
		console.log("Normal Callback: " + message);
	});
}
// 循环 2，把消息作为 msg 参数传递的包装器函数函数
for (var idx in cars) {
	var message = "Saw a " + cars[idx];
	(function(msg) {
		logCar(msg, function() {
			console.log("Closure Callback: " + msg);
		});
	})(message);
}
```
输出：  
```
$ node callback_closure.js
Normal Callback: Saw a Bugatti
Normal Callback: Saw a Bugatti
Normal Callback: Saw a Bugatti
Closure Callback: Saw a Ferrari
Closure Callback: Saw a Porsche
Closure Callback: Saw a Bugatti
```

### 4.3.3 链式回调  
使用异步函数时，如果两个函数都在事件队列上，无法保证它们的运行顺序。最佳方法是让来自异步函数的回调在此调用该函数，
直到没有更多的工作要做，以执行链式回调。这样，异步函数永远不会在时间队列上超过一次。  
以下代码中，条目列表被传递到函数 logCars()，然后异步函数 logCar() 被调用，并且 logCars() 函数作为当 logCar() 完成
时的回调函数。一次，同一时间只有一个版本的 logCar() 在事件队列上。  
```
// callback_chain.js：实现一个回调链，在此来自一个匿名函数的
// 回调函数回调到最初的函数来遍历列表
function logCar(car, callback) {
	console.log("Saw a %s", car);
	if(cars.length) {
		process.nextTick(function() {
			callback();
		});
	}
}
function logCars(cars) {
	var car = cars.pop();
	logCar(car, function() {
		logCars(cars);
	});
}
var cars = ["Ferrari", "Porsche", "Bugatti", "Lamborghini", "Aston Martin"];
logCars(cars);
```
输出：  
```
$ node callback_chain.js
Saw a Aston Martin
Saw a Lamborghini
Saw a Bugatti
Saw a Porsche
Saw a Ferrari
```
















