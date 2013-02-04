/**
 * @fileOverview JXN VS ObjectJS+XN 好汉征集令
 * @author kai.xu(kai.xu@renren-inc.com)
 *
 */

;(function() {

	/* DOM操作模型 */
	var food = $('food'), mouse = $('mouse'), eye = $('eye');
	food.addEvent('click', function() {

	});

	/* 算法模型 */
	var latency = 500, timer = 0, flag = 1, left = parseInt(food.getStyle('left')), top = parseInt(food.getStyle('top')), delta = 50;

	var forwardHook = function(times) {
		return !!(times / 10 % 2 < 1);
	}, easeHook = function() {
		return !!((flag *= -1) < 0);
	};

	(function(s, e) {
		if (e <= s) {
			this.style.top = (s--) + 'px';

			var self = this, callee = arguments.callee;
			setTimeout(function() {
				callee.call(self, s, e);
			}, 50);
		} else {
			food['horiMove'] = arguments.callee;
		}
	}).call(food, top, top + 50);
	top += 50;

	var horizontalTimer = setInterval(function() {
		if (parseInt(food.getStyle('top')) > top)
			return;

		food.horiMove(top, top - 50);
		top -= 50;
	}, latency), verticalTimer = setInterval(function() {
		;
	}, latency);

})();

