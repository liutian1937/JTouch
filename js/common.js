/*
	Name: Javascript Common Function
	Link: niumowang.org
	Author: ok8008@yeah.net
*/
function addClass(element,value){
	if(!element.className){
		element.className = value;
	}else{
		var oValue = element.className;
		oValue += " ";
		oValue += value;
		element.className = oValue;
	}
};
function removeClass(element, className){
	var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
	if (element.className.match(reg)){
		var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
		element.className = element.className.replace(reg, ' ');
	}
};