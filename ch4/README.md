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






















