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