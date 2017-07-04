// 创建和操作一个 Buffer 对象的切片
var numbers = new Buffer("123456789");
console.log(numbers.toString());
var slice = numbers.slice(3, 6);
console.log(slice.toString());
slice[0] = '#'.charCodeAt(0);
console.log(slice.toString());
console.log(numbers.toString());