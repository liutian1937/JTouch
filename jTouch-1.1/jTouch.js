/*
jTouch v1.0  2013-05-20
https://github.com/liutian1937/jTouch
ok8008@yeah.net
 */
(function () {
	var TapTimes = 0,
	TapTimeout,
	LongTimeout,
	LastDirect = ''; //定义全局变量
 	var TouchAction = function (element,event,touch) {
		/*
		函数TouchAction主要针对点击，滑动的处理，手势变换用下面Gesture
		点击事件：Tap,DoubleTap,LongTap,Swipe(滑动),Flip(轻拂)
		 */
		this.evt = event;
		this.touch = touch || undefined;
		this.startX = this.currentX = event.pageX; //初始化点击开始的位置，X
		this.startY = this.currentY = event.pageY; //初始化点击开始的位置，Y
		this.eventType = null; //初始化事件类型
		this.startTime = new Date(); //点击开始计时，初始点击时间
		this.checkLongTap(element); //检查是否是长按
	};
	TouchAction.prototype = {
		getTapType : function () {
			//判断点击类型，tap与doubletap
			var _this = this;
			TapTimes = (TapTimes == 0) ? 1 : TapTimes + 1;
			if (TapTimes == 1) {
				_this.eventType = 'tap';
			} else if (TapTimes == 2) {
				_this.eventType = 'doubletap';
				clearTimeout(TapTimeout);
			} else {
				TapTimes = 0;
			};
		},
		checkLongTap : function (element) {
			//长按检测，longtap
			var _this = this;
			clearTimeout(LongTimeout);
			LongTimeout = setTimeout(function () {
					_this.eventType = 'longtap';
					_this.touchCallback(element);
				}, 500);
		},
		move : function (element,touch) {
			//手指在对象上滑动
			var _this = this;
			clearTimeout(LongTimeout); //取消长按检测

			_this.currentX = touch.pageX; //获取当前坐标值，pageX为到窗口的距离
			_this.currentY = touch.pageY;

			var offsetX = _this.currentX - _this.startX; //计算手指滑动的横向长度
			var offsetY = _this.currentY - _this.startY; //计算手指滑动的纵向长度


			/*
			move的时候定义事件类型eventType:swipe 或者 hold
			 */
			if (_this.eventType == 'longtap' || _this.eventType == 'hold') {
				_this.eventType = 'hold';
			} else {
				_this.eventType = 'swipe';
			}

			var data = {};
			if (Math.abs(offsetX) > Math.abs(offsetY) || LastDirect == 'LeftRight') {
				/*
				如果上次的移动方向是左右
				或者横向滑动大于纵向，是左右滑动
				 */
				data['direction'] = offsetX > 0 ? 'right' : 'left';
				LastDirect = 'LeftRight';
			} else {
				/*
				纵向滑动大于横向，是上下滑动
				 */
				data['direction'] = offsetY > 0 ? 'down' : 'up';
			}
			data['x'] = offsetX;
			data['y'] = offsetY;
			_this.touchCallback(element, data); //执行回调函数
		},
		process : function (element) {
			//touch结束后执行
			var _this = this;
			var offsetX = _this.currentX - _this.startX; //移动横向距离
			var offsetY = _this.currentY - _this.startY; //移动纵向距离

			if (_this.eventType && _this.eventType !== 'swipe' && _this.eventType !== 'hold') {
				return false;
			};
			clearTimeout(LongTimeout); //清除长按检测

			if (offsetX == 0 && offsetY == 0) {
				//两次触摸没有距离移动
				_this.getTapType();
				if (TapTimes == 1) {
					TapTimeout = setTimeout(function () {
							_this.touchCallback(element);
						}, 250);
				} else if (TapTimes == 2) {
					_this.touchCallback(element);
				}
			} else if (Math.abs(offsetY) > 0 || Math.abs(offsetX) > 0) {
				var data = {};
				data['x'] = offsetX;
				data['y'] = offsetY;

				if (new Date() - _this.startTime <= 200) {
					//时间小于200，动作为轻拂：flip
					if (Math.abs(offsetY) > Math.abs(offsetX)) {
						data['direction'] = offsetY > 0 ? 'down' : 'up';
					} else {
						data['direction'] = offsetX > 0 ? 'right' : 'left';
					}
					/*
					如果需要左上，左下，右上，右下
					删除上面的方向判断，取消这里注释
					if(Math.abs(offsetY) > Math.abs(offsetX)){
					if(Math.abs(offsetY/offsetX) <= 1.2){
					data['direction'] = offsetX > 0 ? 'RightTop': 'LeftTop';
					}else{
					data['direction'] = offsetY > 0 ? 'down': 'up';
					}
					}else{
					if(Math.abs(offsetX/offsetY) <= 1.2){
					data['direction'] = offsetY > 0 ? 'RightBottom': 'LeftBottom';
					}else{
					data['direction'] = offsetX > 0 ? 'right': 'left';
					}
					}
					 */

					_this.eventType = 'flip';
				} else {
					//滑动结束，swipe end
					data['status'] = 'end';
				}
				_this.touchCallback(element, data);
			};
		},
		touchCallback : function (element, data) {
			//回调函数
			var _this = this;
			var data = data || {};
			data['fingerNum'] = this.touch && _this.evt.changedTouches.length;
			var len = this.touch && _this.evt.changedTouches.length;
			if (!this.touch || _this.touch.identifier == _this.evt.changedTouches[len - 1].identifier) {
				if (element.typeFn[_this.eventType])
					element.typeFn[_this.eventType](_this.evt, data); //执行函数
				TapTimes = 0;
			}
		}
	};

	var Gesture = function (event, element) {
		this.data = {};
		this.eventType = null;
		this.rotateActive = this.pinchActive = false;
	};
	Gesture.prototype = {
		change : function (event, element) {
			var _this = this;
			if (element.objEvent.touches.length == 2) {
				if (!_this.startData) {
					_this.startData = _this.getData(element);
				}
				_this.currentData = _this.getData(element);
				var diffAngle = _this.getAngle(_this.startData) - _this.getAngle(_this.currentData);
				var diffDistance = _this.getDistance(_this.startData) - _this.getDistance(_this.currentData);
				console.log(Math.abs(diffDistance));
				if (Math.abs(diffAngle) > 10 || _this.rotateActive) {
					_this.eventType = 'rotate';
					_this.data['direction'] = (event.rotation < 0) ? 'left' : 'right';
					_this.data['rotation'] = event.rotation;
					_this.gestureCallback(event, element, _this.data);
					_this.rotateActive = true;
				};
				if (Math.abs(diffDistance) > 10 || _this.pinchActive) {
					_this.eventType = 'pinch';
					_this.data['type'] = (event.scale < 1) ? 'in' : 'out';
					_this.data['scale'] = event.scale;
					_this.gestureCallback(event, element, _this.data);
					_this.pinchActive = true;
				};
			};
		},
		end : function (event, element) {
			var _this = this;
			_this.data['rotation'] = event.rotation;
			_this.data['scale'] = event.scale;
			_this.data['status'] = 'end';
			_this.gestureCallback(event, element, _this.data);
		},
		gestureCallback : function (event, element, data) {
			var _this = this;
			if (element.typeFn[_this.eventType])
				element.typeFn[_this.eventType](event, data);
		},
		getData : function (element) {
			var _this = this;
			var touchList = element.objEvent.touches;
			var ret = new Array();
			for (var i = 0; i < touchList.length; i++) {
				ret.push({
					x : touchList[i].pageX,
					y : touchList[i].pageY
				});
			};
			return ret;
		},
		getAngle : function (data) {
			var A = data[0];
			var B = data[1];
			var angle = Math.atan((B.y - A.y) * -1 / (B.x - A.x)) * (180 / Math.PI);
			if (angle < 0) {
				return angle + 180;
			} else {
				return angle;
			}
		},
		getDistance : function (data) {
			var A = data[0];
			var B = data[1];
			return Math.sqrt((B.x - A.x) * (B.x - A.x) + (B.y - A.y) * (B.y - A.y)) * -1;
		}
	};
	
	var Touch = function (obj) {
		if(!(this instanceof Touch)){
			return new Touch(obj);
		};
		var _this = this;
		_this.obj = obj || window;
		_this.init();
	};
	Touch.prototype = {
		on : function (type, callback) {
			this.typeFn[type] = callback; //给typeFn添加对应的事件
			return this;
		},
		init : function () {
			var _this = this;
			_this.touches = {}; //touch对象哈希表
			_this.typeFn = {}; //点击类型哈希表
			_this.gesture = null;
			_this.handleHash = {};
			if(isTouch()){
				//是否支持touch事件
				_this.bind(_this.obj,'touchstart',_this.touchStart);
				_this.bind(_this.obj,'touchmove',_this.touchMove);
				_this.bind(_this.obj,'touchend',_this.touchEnd);
				_this.bind(_this.obj,'touchcancel',_this.touchCancel);
				_this.bind(_this.obj,'gesturestart',_this.gestureStart);
				_this.bind(_this.obj,'gesturechange',_this.gestureChange);
				_this.bind(_this.obj,'gestureend',_this.gestureEnd);
			} else if(isPointer() || isMSPointer()) {
				_this.bind(_this.obj,'MSPointerDown',_this.touchStart);
				_this.bind(_this.obj,'MSPointerUp',_this.touchEnd);
				_this.bind(_this.obj,'MSPointerMove',_this.touchMove);
				_this.bind(_this.obj,'mousewheel',_this.mouseWheel);
			} else {
				var mousewheel = (document.hasOwnProperty('onmousewheel')) ? "mousewheel" : "DOMMouseScroll" ;
				_this.bind(_this.obj,'mousedown',_this.touchStart);
				_this.bind(_this.obj,'mouseup',_this.touchEnd);
				_this.bind(_this.obj,'mousemove',_this.touchMove);
				_this.bind(_this.obj,mousewheel,_this.mouseWheel);
			};
		},
		touchStart : function (event) {
			event.preventDefault(); //阻止浏览器默认动作
			var _this = this;
			_this.touches = {};
			_this.objEvent = event;
			if(isTouch()){
				_this.touchLoop(event, function (touch) {
					_this.touches[touch.identifier] = new TouchAction(_this,event,touch);
				});
			}else{
				_this.touches = new TouchAction(_this,event);
			};
			if (_this.typeFn['start']) {
				_this.typeFn['start'](event);
			};
		},
		touchMove : function (event) {
			event.preventDefault(); //阻止浏览器默认动作
			var _this = this;
			_this.objEvent = event;
			if(isTouch()){
				_this.touchLoop(event, function (touch) {
					var touchTarget = _this.touches[touch.identifier];
					if (touchTarget) {
						touchTarget.move(_this,touch); //touchMove时执行函数
					};
				});
			}else{
				if (_this.touches instanceof TouchAction){
					_this.touches.move(_this,event)
				};
			}
		},
		touchEnd : function (event) {
			event.preventDefault(); //阻止浏览器默认动作
			var _this = this;
			if(isTouch()){
				_this.touchLoop(event, function (touch) {
					_this.touchClear(touch, false);
				});
			}else{
				_this.touches.process(_this);
				_this.touches = {};
			}
			if (_this.typeFn['end']) {
				_this.typeFn['end'](event);
			};
		},
		touchCancel : function (event) {
			event.preventDefault(); //阻止浏览器默认动作
			var _this = this;
			_this.touchLoop(event, function (touch) {
				_this.touchClear(touch, true);
			});
		},
		touchLoop : function (event, callback) {
			var len = event.changedTouches.length;
			callback(event.changedTouches[len - 1]);
		},
		touchClear : function (touch, cancelled) {
			var _this = this;
			if (!cancelled) {
				var touchTarget = _this.touches[touch.identifier];
				if (touchTarget) {
					touchTarget.process(_this); //touchEnd时执行函数
				};
			};
			delete _this.touches[touch.identifier];
		},
		mouseWheel : function (event) {
			var _this = this, data = {}, delta = event.wheelDelta ? (event.wheelDelta / 120) : (- event.detail / 3);
			data['direction'] = (delta > 0)?'up':'down';
			if (_this.typeFn['mousewheel']) {
				_this.typeFn['mousewheel'](event,data);
			};
		},
		gestureStart : function (event) {
			event.preventDefault(); //阻止浏览器默认动作
			var _this = this;
			_this.gesture = new Gesture(event, _this);
		},
		gestureChange : function (event) {
			event.preventDefault();
			var _this = this;
			_this.gesture.change(event, _this);
		},
		gestureEnd : function (event) {
			var _this = this;
			_this.gesture.end(event, _this);
			_this.gesture = null;
		},
		bind : (function() {
			if (window.addEventListener) {
				return function(el, type, fn, capture) {
					var _this = this;
					el.addEventListener(type, function(){
						fn.call(_this,arguments[0]);
						_this.handleHash[type] = arguments.callee;
					}, (capture));
				};
			} else if (window.attachEvent) {
				return function(el, type, fn, capture) {
					var _this = this;
					el.attachEvent("on" + type, function(){
						fn.call(_this,arguments[0]);
						_this.handleHash[type] = arguments.callee;
					});
				};
			}
		})(),
		unbind : (function(){
			if (window.addEventListener) {
				return function(el, type ) {
					var _this = this;
					if(_this.handleHash[type]){
						el.removeEventListener(type, _this.handleHash[type]);
					};
				};
			} else if (window.attachEvent) {
				return function(el, type) {
					var _this = this;
					if(_this.handleHash[type]){
						el.detachEvent("on" + type, _this.handleHash[type]);
					};
				};
			}
		})(),
		destory : function () {
			var _this = this, i;
			for(i in _this.handleHash){
				_this.unbind(_this.obj,i,_this.handleHash[i]);
			}
		}
	};
	
	function isTouch() {
		return document.hasOwnProperty('ontouchstart');
	};
	function isMSPointer() {
		return window.navigator.msPointerEnabled;
	};
	function isPointer() {
		return window.navigator.pointerEnabled;
	};	
	
	window.jTouch = Touch;
}());