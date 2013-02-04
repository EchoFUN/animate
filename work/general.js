/**
 * @fileOverview JXN VS ObjectJS+XN 好汉征集令
 * @author kai.xu(kai.xu@renren-inc.com)
 *
 */

;(function() {

	// 变量选取
	var food = $('food'), mouse = $('mouse'), eye = $('eye');

	var _eatting = false;

	var Move = function() {
		this._horizontal(function() {

		});

		this._vertical(t, b, c, d);
	};
	var mp = Move.prototype;
	mp._horizontal = function() {

	};

	mp._vertical = function(t, b, c, d) {
		
		return c * Math.sqrt(1 - ( t = t / d - 1) * t) + b;
	};

	mp._eated = function() {
		_eatting = true;

	};

	new Move;
})();

