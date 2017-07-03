// callback_closure.js������һ����װ���������ṩ�첽�ص�����ı����ıհ�
function logCar(logMsg, callback) {
	process.nextTick(function() {
		callback(logMsg);
	});
}
var cars = ["Ferrari", "Porsche", "Bugatti"];
// �����Ļص�����
for (var idx in cars) {
	var message = "Saw a " + cars[idx];
	logCar(message, function() {
		console.log("Normal Callback: " + message);
	});
}
// ����Ϣ��Ϊ msg �������ݵİ�װ����������
for (var idx in cars) {
	var message = "Saw a " + cars[idx];
	(function(msg) {
		logCar(msg, function() {
			console.log("Closure Callback: " + msg);
		});
	})(message);
}
// ��ͨѭ������ʹ�ûص�����
for (var idx in cars) {
	var message = "Saw a " + cars[idx];
	console.log("My Callback: " + message);
}