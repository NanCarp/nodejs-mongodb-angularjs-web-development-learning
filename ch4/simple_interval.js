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