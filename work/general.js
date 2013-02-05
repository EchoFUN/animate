/**
 * @fileOverview JXN VS ObjectJS+XN 好汉征集令
 * @author kai.xu(kai.xu@renren-inc.com)
 *
 */

;(function() {

	// 变量选取
	var food = $('food'), mouse = $('mouse'), eye = $('eye');
	var foodStyle = food.style;

	var _eatting = false, _flag = 1, _flag2 = 1;

	// 移动算法
	var _calEaseOut = function(t, b, c, d) {
		return c * (( t = t / d - 1) * t * t + 1) + b;
	}, _calEaseIn = function(t, b, c, d) {
		return c * (t /= d) * t * t + b;
	};

	var Move = function() {
		// this._horizontal();
		this._vertical();
	};
	var mp = Move.prototype;
	mp._horizontal = function(t, b, c, d) {
		if (t < 1440) {
			t++;
			var changeSet = (_flag2 > 0) ? _calEaseOut(t, b, c, d) : _calEaseIn(t, b, c, d);
			foodStyle.left = changeSet + 'px';

			// 横向循环
			var self = this;
			setTimeout(function() {
				self._horizontal(t, b, c, d);
			}, 10);
		} else {
			_flag2 *= -1;
			if (_flag2 > 0)
				this._horizontal(0, 1440, -1440, 100);
			else
				this._horizontal(0, 0, 1440, 100);
		}
	};

	mp._vertical = function(t, b, c, d) {
		if (d > t) {
			t++;
			var changeSet = (_flag > 0) ? _calEaseOut(t, b, c, d) : _calEaseIn(t, b, c, d);
			foodStyle.top = changeSet + 'px';

			// 纵向循环
			var self = this;
			setTimeout(function() {
				self._vertical(t, b, c, d);
			}, 10);
		} else {
			_flag *= -1;
			if (_flag > 0)
				this._vertical(0, 600, -300, 100);
			else
				this._vertical(0, 300, 300, 100);
		}
	};

	mp._eated = function() {
		_eatting = true;

	};

	new Move;
})();
