/**
 * @fileOverview JXN VS ObjectJS+XN 好汉征集令
 * @author kai.xu(kai.xu@renren-inc.com)
 *
 */

/* DOM操作模型 */
var food = $('food'), mouse = $('mouse'), eye = $('eye');
var foodStyle = food.style;
food.addEvent('click', function() {

});

/* 算法模型 */
var latency = 500, timer = 0, flag = 1, left = parseInt(foodStyle.left), top = parseInt(foodStyle.top);

var forwardHook = function(times) {
	return !!(times / 10 % 2 < 1);
}, easeHook = function() {
	return !!((flag *= -1) < 0);
};

var horizontalTimer = setInterval(function() {
	
}, latency), verticalTimer = setInterval(function() {

}, latency);
