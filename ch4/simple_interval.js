// simple_interval.js �ڲ�ͬ��ʱ����ʵ����һϵ�еĸ��»ص�
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