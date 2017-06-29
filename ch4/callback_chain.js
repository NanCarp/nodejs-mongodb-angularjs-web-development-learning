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