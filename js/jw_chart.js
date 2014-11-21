// JavaScript Document




function JWChart(divId){
	var _canvas;
	var _context;
	var _wrap;
	var _width = 500;
	var _height = 300;
	var _chartWidth;
	var _chartHeight;
	var _chartStartX;	//绘图区域的起点坐标
	var _chartStartY;	//绘图区域的起点坐标
	var _lineColor = "#333333";
	var _lineWidth = 2;
	var _ifShowShadow = true;
	var _shadowColor = "#eeeeee";
	var _shadowOpacity = 0.6;
	var _axisColor = "#cccccc";
	var _gridColor = "#cccccc";
	var _maxValue=0;
	var _data = [];
	var _labelFontSize = 14;
	var _labelColor = "#cccccc"
	var _ifShowTip = true;
	var _tipColor = "#cccccc";
	var _tipFontSize = 12;
	var _padding = [20,20,50,20];
	var _ifDrawBase = false;
	
	
	
	
	//初始化函数
	function _init(){
		_canvas = document.createElement("canvas");
		_wrap = document.getElementById(divId);
		_wrap.innerHTML = "";
		_wrap.appendChild(_canvas);
		_canvas.width = _width;
		_canvas.height = _height;
		_canvas.style.width = _width+"px";
		_canvas.style.height = _height+"px";
		_canvas.style.position = "relative";
		_context = _canvas.getContext("2d");
	}
	
	//设置大小
	function _setSize(width, height){
		_width = width;
		_height = height;
		_canvas.width = width;
		_canvas.height = height;
		_canvas.style.width = width+"px";
		_canvas.style.height = height+"px";
	}
	this.setSize = _setSize;
	
	//设置要描述的数据
	function _setData(aData){
		_data.push(aData);
	}
	this.setData = _setData;
	
	//设置趋势线的颜色
	function _setLineColor(color){
		_lineColor = color;
	}
	this.setLineColor = _setLineColor;
	
	//设置Y值标识的颜色
	function _setTipColor(color){
		_tipColor = color;
	}
	this.setTipColor = _setTipColor;
	
	//设置Y值标识的显示与否
	function _setShowTip(bol){
		_ifShowTip = bol;
	}
	this.setShowTip = _setShowTip;
	
	//设置趋势线的颜色
	function _setLabelColor(color){
		_labelColor = color;
	}
	this.setLabelColor = _setLabelColor;
	
	//设置坐标轴的颜色
	function _setAxisColor(color){
		_axisColor = color;
	}
	this.setAxisColor = _setAxisColor;
	
	//设置Grid参考线的颜色
	function _setGridColor(color){
		_gridColor = color;
	}
	this.setGridColor = _setGridColor;
	
	
	//设置趋势线的宽度,默认为2
	function _setLineWidth(width){
		_lineWidth = width;
	}
	this.setLineWidth = _setLineWidth;
	
	//设置趋势线下阴影的颜色
	function _setShadowColor(color){
		_shadowColor = color;
	}
	this.setShadowColor = _setShadowColor;
	
	//设置趋势线下阴影的颜色
	function _setShadowOpacity(opacity){
		_shadowOpacity = opacity;
	}
	this.setShadowOpacity = _setShadowOpacity;
	
	//设置趋势线下阴影的是否显示
	function _setShowShadow(isShow){
		_ifShowShadow = isShow;
	}
	this.setShowShadow = _setShowShadow;
	
	//设置绘图区域离canvas边缘的距离
	function _setPadding(t,r,b,l){
		_padding = [t,r,b,l];
	}
	this.setPadding = _setPadding;
	
	function _setMaxValue(val){
		_maxValue = val;
	}
	this.setMaxValue = _setMaxValue;
	
	
	
	//画基础的内容，有画参考线和label
	function _drawBase(){
		/* 计算基本的参数 */
		_chartStartX = _padding[3]; //起点是padding-left之后
		_chartStartY = _height - _padding[2];
		_chartWidth = _width - _padding[3] - _padding[1]; 
		_chartHeight = _height - _padding[0] - _padding[2];
		var data = _data[0];
		if(_maxValue==0){
			//只有在maxValue未人工设置时，才需要计算
			for(var i=0; i<data.length; i++){
				if(data[i][1]>_maxValue){
					_maxValue = data[i][1];
				}
			}
			_maxValue = _ceilMax(_maxValue);
		}
		
		_context.save();
		_context.beginPath();
		//画Y轴
		_context.lineWidth = 1;
		_context.strokeStyle = _axisColor;
		_context.moveTo(_chartStartX,(_chartStartY+2));
		_context.lineTo(_chartStartX+_chartWidth,(_chartStartY+2));
		_context.closePath();
		_context.stroke();
		_context.restore();
		//画Grid
		var singleInt = _parseIntMax(_maxValue);
		var gridLineNum = 0;
		switch(singleInt){
			case 1: 
				gridLineNum = 5;
				break;
			case 2:
				gridLineNum = 4;
				break;
			default:
				gridLineNum = singleInt;
		}
		_context.save();
		_context.strokeStyle = "#990000";
		var startDotX, startDotY, endDotX, endDotY;
		startDotX = _chartStartX;
		endDotX = _chartStartX + _chartWidth;
		_context.beginPath();
		_context.lineWidth = 1;
		//_context.lineJoin = "bevel";
		for(var i=1; i<gridLineNum; i++){
			startDotY = endDotY = Math.ceil(_padding[0] + (1-i/gridLineNum)*_chartHeight)+0.5;
			_context.moveTo(startDotX, startDotY);
			_context.lineTo(endDotX, endDotY);
			
		}
		_context.stroke();
		_context.closePath();
		_context.restore();
		
		
		_ifDrawBase = true;
		
	}
	
	//执行趋势线的描绘命令
	function _draw(){
		//还没有画参考线和label的话，就先画上。如果是第二次调用这个函数。那不需要再画参考线和label,而直接执行下面的画趋势线。
		if(!_ifDrawBase){
			_drawBase();
		}
		
		var data = _data[_data.length-1];
		
		//画曲线
		var points = [];
		var dotY;
		_context.save();
		_context.beginPath();
		_context.strokeStyle = _lineColor;
		_context.fillStyle = _shadowColor;
		_context.lineWidth = _lineWidth;
		_context.lineJoin = "round";
		dotY = (data[0][1]/_maxValue)*_chartHeight;
		_context.moveTo(_chartStartX,_padding[0]+_chartHeight - dotY);
		points.push([_chartStartX,_padding[0]+_chartHeight - dotY]);
		for(var i=1; i < data.length; i++){
			dotY = (data[i][1]/_maxValue)*_chartHeight;
			_context.lineTo(_chartStartX+(i/(data.length-1))*_chartWidth, _padding[0]+_chartHeight-dotY);
			points.push([_chartStartX+(i/(data.length-1))*_chartWidth, _padding[0]+_chartHeight-dotY]);
			//msg.innerHTML = msg.innerHTML + "moveTo "+ _chartStartX+(i/data.length)*_chartWidth+","+endDotY+"<br />";
		}
		_context.stroke();
		if(_ifShowShadow){
			//画阴影
			_context.lineTo(_chartStartX+_chartWidth,_chartHeight+_padding[0]+1);
			_context.lineTo(_chartStartX,_chartHeight+_padding[0]+1);
			_context.globalAlpha = _shadowOpacity;
			_context.fill();
		}
		
		_context.closePath();
		_context.restore();
		
		//画x轴上的x读数
		_context.font = "normal "+ _labelFontSize +"pt Arial";
		_context.fillStyle = _labelColor;
		for(var i=0; i<points.length; i++){
			_drawtext(data[i][0],points[i][0],_chartHeight + _padding[0]+26);
		}
		
		if(_ifShowTip){
			_context.font = "normal "+ _tipFontSize +"pt Arial";
			_context.fillStyle = _tipColor;
			for(var i=0; i<points.length; i++){
				_drawtext(data[i][1],points[i][0],points[i][1]-10);
			}
		}
		
		
	}
	this.draw = _draw;
	
	function _drawtext(str, x, y){
		_context.save();
		x-=(_context.measureText(str).width/2);
		_context.beginPath();
		_context.fillText(str,x,y);
		_context.restore();
	}

	function _ceilMax(num){
		var tmpA, enlargeBit=1, minBit=1;
		
		//把小于1的(0.025)转化成正常的25;
		if(num<1){
			tmpA = num.toString();
			enlargeBit = Math.pow(10,tmpA.length-2);
			num = num*enlargeBit;
		}
		tmpA = parseInt(num).toString();
		minBit = Math.pow(0.1, tmpA.length-1);
		num = num * minBit;
		num = Math.ceil(num);
		enlargeBit = 1/enlargeBit;
		minBit = 1/minBit;
		return num*enlargeBit*minBit;
	}
	function _parseIntMax(num){
		var tmpA, enlargeBit=1, minBit=1, afterEnlarge;
		
		//把小于1的(0.025)转化成正常的25;
		if(num<1){
			tmpA = num.toString();
			if(tmpA.length>4){
				enlargeBit = Math.pow(10,4-2);
			}else{
				enlargeBit = Math.pow(10,tmpA.length-2);
			}
			
			num = parseInt(num*enlargeBit);
		}
		tmpA = parseInt(num).toString();
		minBit = Math.pow(0.1, tmpA.length-1);
		num = num * minBit;
		num = Math.ceil(num);
		
		return num;
	}
	
	
	_init();
}