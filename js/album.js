/*
	Name: Javascript Album Plugin 
	Link: niumowang.org
	Author: ok8008@yeah.net
*/
var ImgSrc;
(function(){
	var Album = function(){
		var _this = this;
		_this.init();
		_this.timer = null;//translate计时器
		_this.moved = false;//控制是否可以translate
		window.addEventListener('orientationchange',function(){
			_this.resize();
		},false);
	};
	Album.prototype = {
		getId:function(id){
			return document.getElementById(id);
		},
		init:function(){
			var _this = this;
			if(!_this.getId('mark')){
				var mark = document.createElement('div');
				mark.id = 'mark';
				document.body.appendChild(mark);
			};
			if(!_this.getId('ImgWrap')){
				var ImgWrap = document.createElement('div');
				ImgWrap.id = 'ImgWrap';
				document.body.appendChild(ImgWrap);
			};
			_this.mark = _this.getId('mark');
			_this.wrap = _this.getId('ImgWrap');
		},
		show:function(url){
			//显示图片
			var _this = this;
			_this.mark.style.display = 'block';
			_this.wrap.style.display = 'table';
			if(url != ImgSrc){
				_this.wrap.innerHTML = '<div class="ImgWrap"><img src="'+url+'"></div>';
				ImgSrc = url;
			};
			_this.imgParent = _this.wrap.getElementsByTagName('div')[0];
			_this.img = _this.imgParent.getElementsByTagName('img')[0];
			
			_this.imgWidth = _this.img.offsetWidth;
			_this.imgHeight = _this.img.offsetHeight;
			
			_this.resize();
			_this.LastScale = 1;
			
			_this.LastPerX = _this.LastPerY = 0; //滚动范围内，一直变化的百分比
			_this.LimitX = _this.LimitY = 0; //滚动范围限制百分比
			_this.EndPerX = _this.EndPerY = 0;//滚动结束后的百分比
		},
		resize:function(){
			var _this = this;
			_this.wrapWidth = document.body.offsetWidth;
			_this.wrapHeight = document.body.offsetHeight;
			
			if(_this.imgWidth/_this.imgHeight >= _this.wrapWidth/_this.wrapHeight){
				_this.imgHeight = _this.wrapWidth*_this.imgHeight/_this.imgWidth;
				_this.imgWidth = _this.wrapWidth;
			}else{
				_this.imgWidth = _this.wrapHeight*_this.imgWidth/_this.imgHeight;
				_this.imgHeight = _this.wrapHeight;
			}
			_this.img.style.width = _this.imgWidth+'px';
			_this.img.style.height = _this.imgHeight+'px';
			
		},
		scale:function(num,end){
			var _this = this;
			
			//禁止move事件发生
			_this.moved = false;
			if(_this.timer){
				clearTimeout(_this.timer);
			};
			
			var scale = _this.LastScale * num;
			_this.img.style.webkitTransform = "scale3d("+scale+","+scale+", 0)";
			_this.mark.style.opacity = 0.5*scale;
 			

			if(end){
				var goLimit = false;
				_this.LastScale = scale;
				
				//计算图像的宽高值
				_this.LastWidth = _this.imgWidth * _this.LastScale;
				_this.LastHeight = _this.imgHeight * _this.LastScale;
				
				if(_this.LastWidth < 400 || _this.LastHeight < 300){
					//图片缩小到400，300时，关闭显示
					_this.close();
				};
				if(_this.LastWidth < _this.wrapWidth && _this.LastHeight < _this.wrapHeight){
					//如果宽高小于窗口宽高，那么初始化图片
					_this.img.style.webkitTransform = 'scale3d(1,1,0)';
					_this.imgParent.style.webkitTransform = 'translate3d(0,0,0)';
					return false;
				}else{
					//获取拖拽的临界值
					_this.LimitX = (_this.LastWidth > _this.wrapWidth)?((_this.LastWidth - _this.wrapWidth)*50)/_this.wrapWidth:0;//拖拽的临界值，横向百分比
					_this.LimitY = (_this.LastHeight > _this.wrapHeight)?((_this.LastHeight - _this.wrapHeight)*50)/_this.wrapHeight:0;//拖拽的临界值，纵向百分比
				}
				
				//缩小后，滚动到边界
				if(Math.abs(_this.EndPerX) > _this.LimitX && Math.abs(_this.EndPerY) > _this.LimitY){
					if(_this.EndPerX < 0 && _this.EndPerY < 0){
						_this.limit('RightBottom');
					}else if(_this.EndPerX < 0 && _this.EndPerY > 0){
						_this.limit('RightTop');
					}else if(_this.EndPerX > 0 && _this.EndPerY > 0){
						_this.limit('LeftTop');
					}else if(_this.EndPerX > 0 && _this.EndPerY < 0){
						_this.limit('LeftBottom');
					};
				}else if(Math.abs(_this.EndPerX) > _this.LimitX && Math.abs(_this.EndPerY) <= _this.LimitY){
					var dir = (_this.EndPerX > 0)?'Left':'Right';
					_this.limit(dir);
				}else if(Math.abs(_this.EndPerX) <= _this.LimitX && Math.abs(_this.EndPerY) > _this.LimitY){
					var dir = (_this.EndPerY > 0)?'Top':'Bottom';
					_this.limit(dir);
				}
				
				//延时执行,防止结束后执行translate
				_this.timer = setTimeout(function(){
					if(_this.LastWidth > _this.wrapWidth || _this.LastHeight > _this.wrapHeight)
					_this.moved = true;
				},500)
				
			};
		},
		translate:function(x,y,end){
			var _this = this;
			//removeClass(_this.imgParent,'animate');
			
			//如果没有开启移动，返回false
			if(!_this.moved){
				return false;
			}
			if(_this.LastWidth <= _this.wrapWidth && _this.LastHeight <= _this.wrapHeight){
				//如果大小都小于窗口宽高的话，return false;
				//需要修改为回到初始状态，scale是1，translate是0
				return false;
			 }else if(_this.LastWidth > _this.wrapWidth && _this.LastHeight <= _this.wrapHeight){
				//如果最终图像的宽度大于窗口，那么执行move
				_this.LastPerX = (x/_this.wrapWidth)*100 + _this.EndPerX;
				_this.move(_this.LastPerX,false);
			 }else if(_this.LastWidth <= _this.wrapWidth && _this.LastHeight > _this.wrapHeight){
				//如果最终图像的高度大于窗口，那么执行move
					_this.LastPerY = (y/_this.wrapHeight)*100 + _this.EndPerY;
					_this.move(false,_this.LastPerY);
			 }else{

				_this.LastPerX = (x/_this.wrapWidth)*100 + _this.EndPerX;
				_this.LastPerY = (y/_this.wrapHeight)*100 + _this.EndPerY;
				_this.move(_this.LastPerX,_this.LastPerY);
			 }

			if(end){
				_this.end();
			}
		},
		move:function(x,y){
			var _this = this;
			if(x && y){
				_this.imgParent.style.webkitTransform = 'translate3d('+x+'%,'+y+'%,0)';
			}else if(x && !y){
				_this.imgParent.style.webkitTransform = 'translate3d('+x+'%,0,0)';
			}else if(!x && y){
				_this.imgParent.style.webkitTransform = 'translate3d(0,'+y+'%,0)';
			}
		},
		limit:function(direction){
			var _this = this;
			switch(direction){
				case 'LeftTop':
					_this.LastPerX = _this.LimitX;
					_this.LastPerY = _this.LimitY;
					break;
				case 'LeftBottom':
					_this.LastPerX = _this.LimitX;
					_this.LastPerY = -_this.LimitY;
					break;
				case 'RightTop':
					_this.LastPerX = -_this.LimitX;
					_this.LastPerY = _this.LimitY;
					break;
				case 'RightBottom':
					_this.LastPerX = -_this.LimitX;
					_this.LastPerY = -_this.LimitY;
					break;
				case 'Left':
					_this.LastPerX = _this.LimitX;
					_this.LastPerY = false;
					break;
				case 'Right':
					_this.LastPerX = -_this.LimitX;
					_this.LastPerY = false;
					break;
				case 'Top':
					_this.LastPerX = false;
					_this.LastPerY = _this.LimitY;
					break;
				case 'Bottom':
					_this.LastPerX = false;
					_this.LastPerY = -_this.LimitY;
					break;
			}
			_this.move(_this.LastPerX,_this.LastPerY);
			_this.EndPerX = _this.LastPerX;
			_this.EndPerY = _this.LastPerY;
		},
		end:function(){
			var _this = this;
			if(Math.abs(_this.LastPerX) > Math.abs(_this.LimitX) && Math.abs(_this.LastPerY) > Math.abs(_this.LimitY)){
				_this.EndPerX = (_this.LastPerX > 0)?_this.LimitX:-_this.LimitX;
				_this.EndPerY = (_this.LastPerY > 0)?_this.LimitY:-_this.LimitY;
				_this.move(_this.EndPerX,_this.EndPerY);
			}else if(Math.abs(_this.LastPerX) > Math.abs(_this.LimitX) && Math.abs(_this.LastPerY) <= Math.abs(_this.LimitY)){
				_this.EndPerX = (_this.LastPerX > 0)?_this.LimitX:-_this.LimitX;
				_this.EndPerY = _this.LastPerY;
				_this.move(_this.EndPerX,_this.EndPerY);
			}else if(Math.abs(_this.LastPerX) <= Math.abs(_this.LimitX) && Math.abs(_this.LastPerY) > Math.abs(_this.LimitY)){
				_this.EndPerY = (_this.LastPerY > 0)?_this.LimitY:-_this.LimitY;
				_this.EndPerX = _this.LastPerX;
				_this.move(_this.EndPerX,_this.EndPerY);
			}else{
				_this.EndPerX = _this.LastPerX;
				_this.EndPerY = _this.LastPerY;
			};
		},
		close:function(){
			var _this = this;
			_this.mark.style.display = 'none';
			_this.wrap.style.display = 'none';
		}
	};
	window.Album = Album;
}());