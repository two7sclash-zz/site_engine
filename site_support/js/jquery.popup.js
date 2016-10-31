(function($){
$.fn._popup = function(options){
	var defaults = {
		shadowsize: 0,
		innerdiv: '',
		headercolor: '#0089c5',
		shapediv: 'shapediv',
		sidepopup: false
	}
	$.extend(defaults,options);
	options = defaults;
	var tmptop = $(this).position().top;
	var tmpleft = $(this).offset().left;
	var jg = new jsGraphics(options.shapediv);
	jg.clear();

	if (options.sidepopup != false) {
	
		if ($(this).next().is('dd')) {
			tmpleft = parseInt($(this).next().position().left)+parseInt($(this).next().width()+15);
		}
		else {
			tmpleft += parseInt($(this).width()+15);
		}
		
		/*var x = new Array(0,-15,0);
		var y = new Array(-2,12,26);*/
		/*var x = new Array(-2, -12, -2);
		var y = new Array(0, 10, 20);*/
		
		jg.setColor('transparent');
		jg.fillPolygon(new Array(0,0,-30,-30), new Array(0,50,50, 0));
	}
	else {
		tmptop += parseInt($(this).height())+15;
		/*var x = new Array(30,40,50);
		var y=new Array(0,-15,0);*/
		jg.setColor('transparent');
		jg.fillPolygon(new Array(0,100,100,0), new Array(0,0,-15, -15));
	}
	
	var div = $(options.innerdiv);
	div.css({position:'absolute',top:tmptop+'px',left:tmpleft+'px'}).show().dropShadow();
	//div.find('#header').css('background-color', options.headercolor);

	//jg.setColor(options.headercolor);	
	//jg.fillPolygon(x,y);
	
	jg.paint();
	
}
	
$.fn._popupclose = function(options) {
	var defaults = {
		innerdiv:'',
		shapediv: 'shapediv'	
	}
	$.extend(defaults,options);
	options = defaults;
	var jg = new jsGraphics(options.shapediv);
	jg.clear();
	$(options.innerdiv).hide().removeShadow();
}
})(jQuery);