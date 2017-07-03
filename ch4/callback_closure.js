// callback_closure.js：创建一个包装器函数来提供异步回调所需的变量的闭包
function logCar(logMsg, callback) {
	process.nextTick(function() {
		callback(logMsg);
	});
}
var cars = ["Ferrari", "Porsche", "Bugatti"];
// 基本的回调函数
for (var idx in cars) {
	var message = "Saw a " + cars[idx];
	logCar(message, function() {
		console.log("Normal Callback: " + message);
	});
}
// 把消息作为 msg 参数传递的包装器函数函数
for (var idx in cars) {
	var message = "Saw a " + cars[idx];
	(function(msg) {
		logCar(msg, function() {
			console.log("Closure Callback: " + msg);
		});
	})(message);
}
// 普通循环，不使用回调函数
for (var idx in cars) {
	var message = "Saw a " + cars[idx];
	console.log("My Callback: " + message);
}