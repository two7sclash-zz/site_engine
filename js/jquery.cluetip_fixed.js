(function(a){a.cluetip={version:"1.0.5"};var b,c,d,e,f,g,h,i;a.fn.cluetip=function(l,m){if(typeof l=="object"){m=l;l=null}if(l=="destroy"){return this.unbind(".cluetip")}return this.each(function(n){function V(){return false}var o=this,p=a(this);var q=a.extend(true,{},a.fn.cluetip.defaults,m||{},a.metadata?p.metadata():a.meta?p.data():{});var r=false;var s=+q.cluezIndex;p.data("thisInfo",{title:o.title,zIndex:s});var t=false,u=0;if(!a("#cluetip").length){a(['<div id="cluetip">','<div id="cluetip-outer">','<h3 id="cluetip-title"></h3>','<div id="cluetip-inner"></div>',"</div>",'<div id="cluetip-extra"></div>','<div id="cluetip-arrows" class="cluetip-arrows"></div>',"</div>"].join(""))[j](k).hide();b=a("#cluetip").css({position:"absolute"});d=a("#cluetip-outer").css({position:"relative",zIndex:s});c=a("#cluetip-inner");e=a("#cluetip-title");f=a("#cluetip-arrows");g=a('<div id="cluetip-waitimage"></div>').css({position:"absolute"}).insertBefore(b).hide()}var v=q.dropShadow?+q.dropShadowSteps:0;if(!h){h=a([]);for(var w=0;w<v;w++){h=h.add(a("<div></div>").css({zIndex:s-1,opacity:.1,top:1+w,left:1+w}))}h.css({position:"absolute",backgroundColor:"#000"}).prependTo(b)}var x=p.attr(q.attribute),y=q.cluetipClass;if(!x&&!q.splitTitle&&!l)return true;if(q.local&&q.localPrefix){x=q.localPrefix+x}if(q.local&&q.hideLocal){a(x+":first").hide()}var z=parseInt(q.topOffset,10),A=parseInt(q.leftOffset,10);var B,C,D=isNaN(parseInt(q.height,10))?"auto":/\D/g.test(q.height)?q.height:q.height+"px";var E,F,G,H,I,J;var K=parseInt(q.width,10)||275,L=K+(parseInt(b.css("paddingLeft"),10)||0)+(parseInt(b.css("paddingRight"),10)||0)+v,M=this.offsetWidth,N,O,P,Q,R;var S;var T=q.attribute!="title"?p.attr(q.titleAttribute):"";if(q.splitTitle){if(T==undefined){T=""}if(!T){return}S=T.split(q.splitTitle);T=S.shift()}if(q.escapeTitle){T=T.replace(/&/g,"&").replace(/>/g,">").replace(/</g,"<")}var U;var W=function(e){if(!q.onActivate(p)){return false}t=true;b.removeClass().css({width:K});if(x==p.attr("href")){p.css("cursor",q.cursor)}if(q.hoverClass){p.addClass(q.hoverClass)}F=G=p.offset().top;N=p.offset().left;Q=e.pageX;I=e.pageY;if(o.tagName.toLowerCase()!="area"){E=a(document).scrollTop();R=a(window).width()}if(q.positionBy=="fixed"){O=M+N+A;b.css({left:O})}else{O=M>N&&N>L||N+M+L+A>R?N-L-A:M+N+A;if(o.tagName.toLowerCase()=="area"||q.positionBy=="mouse"||M+L>R){if(Q+20+L>R){b.addClass(" cluetip-"+y);O=Q-L-A>=0?Q-L-A-parseInt(b.css("marginLeft"),10)+parseInt(c.css("marginRight"),10):Q-L/2}else{O=Q+A}}var h=O<0?e.pageY+z:e.pageY;b.css({left:O>0&&q.positionBy!="bottomTop"?O:Q+L/2>R?R-L:Math.max(Q-L/2,0),zIndex:p.data("thisInfo").zIndex});f.css({zIndex:p.data("thisInfo").zIndex+1})}C=a(window).height();if(l){if(typeof l=="function"){l=l.call(o)}c.html(l);X(h)}else if(S){var j=S.length;c.html(S[0]);if(j>1){for(var k=1;k<j;k++){c.append('<div class="split-body">'+S[k]+"</div>")}}X(h)}else if(!q.local&&x.indexOf("#")!=0){if(/\.(jpe?g|tiff?|gif|png)$/i.test(x)){c.html('<img src="'+x+'" alt="'+T+'" />');X(h)}else if(r&&q.ajaxCache){c.html(r);X(h)}else{var m=q.ajaxSettings.beforeSend,s=q.ajaxSettings.error,u=q.ajaxSettings.success,v=q.ajaxSettings.complete;var w={cache:false,url:x,beforeSend:function(a){if(m){m.call(o,a,b,c)}d.children().empty();if(q.waitImage){g.css({top:I+20,left:Q+20,zIndex:p.data("thisInfo").zIndex-1}).show()}},error:function(a,d){if(t){if(s){s.call(o,a,d,b,c)}else{c.html("<i>sorry, the contents could not be loaded</i>")}}},success:function(a,d){r=q.ajaxProcess.call(o,a);if(t){if(u){u.call(o,a,d,b,c)}c.html(r)}},complete:function(d,e){if(v){v.call(o,d,e,b,c)}i=a("#cluetip-inner img").length;if(i&&!a.browser.opera){a("#cluetip-inner img").bind("load error",function(){i--;if(i<1){g.hide();if(t)X(h)}})}else{g.hide();if(t){X(h)}}}};var B=a.extend(true,{},q.ajaxSettings,w);a.ajax(B)}}else if(q.local){var D=a(x+(/#\S+$/.test(x)?"":":eq("+n+")")).clone(true).show();c.html(D);X(h)}};var X=function(g){function j(){}b.addClass("cluetip-"+y);if(q.truncate){var i=c.text().slice(0,q.truncate)+"...";c.html(i)}T?e.show().html(T):q.showTitle?e.show().html(" "):e.hide();if(q.sticky){var k=a('<div id="cluetip-close"><a href="#">'+q.closeText+"</a></div>");q.closePosition=="bottom"?k.appendTo(c):q.closePosition=="title"?k.prependTo(e):k.prependTo(c);k.bind("click.cluetip",function(){Z();return false});if(q.mouseOutClose){b.bind("mouseleave.cluetip",function(){Z()})}else{b.unbind("mouseleave.cluetip")}}var l="";d.css({zIndex:p.data("thisInfo").zIndex,overflow:D=="auto"?"visible":"auto",height:D});B=D=="auto"?Math.max(b.outerHeight(),b.height()):parseInt(D,10);H=G;J=E+C;if(q.positionBy=="fixed"){H=G-q.dropShadowSteps+z}else if(O<Q&&Math.max(O,0)+L>Q||q.positionBy=="bottomTop"){if(G+B+z>J&&I-E>B+z){H=I-B-z;l="top"}else{H=I+z;l="bottom"}}else if(G+B+z>J){H=B>=C?E:J-B-z}else if(p.css("display")=="block"||o.tagName.toLowerCase()=="area"||q.positionBy=="mouse"){H=g-z}else{H=G-q.dropShadowSteps}if(l==""){O<N?l="left":l="right"}b.css({top:H+"px"}).removeClass().addClass("clue-"+l+"-"+y).addClass(" cluetip-"+y);if(q.arrows){var m=G-H-q.dropShadowSteps;f.css({top:/(left|right)/.test(l)&&O>=0&&m>0?m+"px":/(left|right)/.test(l)?0:""}).show()}else{f.hide()}h.hide();b.hide()[q.fx.open](q.fx.open!="show"&&q.fx.openSpeed);if(q.dropShadow){h.css({height:B,width:K,zIndex:p.data("thisInfo").zIndex-1}).show()}if(a.fn.bgiframe){b.bgiframe()}if(q.delayedClose>0){u=setTimeout(Z,q.delayedClose)}q.onShow.call(o,b,c)};var Y=function(a){t=false;g.hide();if(!q.sticky||/click|toggle/.test(q.activation)){Z();clearTimeout(u)}if(q.hoverClass){p.removeClass(q.hoverClass)}};var Z=function(){d.parent().hide().removeClass();q.onHide.call(o,b,c);p.removeClass("cluetip-clicked");if(T){p.attr(q.titleAttribute,T)}p.css("cursor","");if(q.arrows)f.css({top:""})};a(document).bind("hideCluetip",function(a){Z()});if(/click|toggle/.test(q.activation)){p.bind("click.cluetip",function(c){if(b.is(":hidden")||!p.is(".cluetip-clicked")){W(c);a(".cluetip-clicked").removeClass("cluetip-clicked");p.addClass("cluetip-clicked")}else{Y(c)}this.blur();return false})}else if(q.activation=="focus"){p.bind("focus.cluetip",function(a){W(a)});p.bind("blur.cluetip",function(a){Y(a)})}else{p[q.clickThrough?"unbind":"bind"]("click",V);var _=function(a){if(q.tracking==true){var c=O-a.pageX;var d=H?H-a.pageY:G-a.pageY;p.bind("mousemove.cluetip",function(a){b.css({left:a.pageX+c,top:a.pageY+d})})}};if(a.fn.hoverIntent&&q.hoverIntent){p.hoverIntent({sensitivity:q.hoverIntent.sensitivity,interval:q.hoverIntent.interval,over:function(a){W(a);_(a)},timeout:q.hoverIntent.timeout,out:function(a){Y(a);p.unbind("mousemove.cluetip")}})}else{p.bind("mouseenter.cluetip",function(a){W(a);_(a)}).bind("mouseleave.cluetip",function(a){Y(a);p.unbind("mousemove.cluetip")})}p.bind("mouseover.cluetip",function(a){p.attr("title","")}).bind("mouseleave.cluetip",function(a){p.attr("title",p.data("thisInfo").title)})}})};a.fn.cluetip.defaults={width:275,height:"auto",cluezIndex:97,positionBy:"auto",topOffset:15,leftOffset:15,local:false,localPrefix:null,hideLocal:true,attribute:"rel",titleAttribute:"title",splitTitle:"",escapeTitle:false,showTitle:true,cluetipClass:"default",hoverClass:"",waitImage:true,cursor:"help",arrows:false,dropShadow:true,dropShadowSteps:6,sticky:false,mouseOutClose:false,activation:"hover",clickThrough:false,tracking:false,delayedClose:0,closePosition:"top",closeText:"Close",truncate:0,fx:{open:"show",openSpeed:""},hoverIntent:{sensitivity:3,interval:300,timeout:0},onActivate:function(a){return true},onShow:function(a,b){},onHide:function(a,b){},ajaxCache:true,ajaxProcess:function(a){a=a.replace(/<(script|style|title)[^<]+<\/(script|style|title)>/gm,"").replace(/<(link|meta)[^>]+>/g,"");return a},ajaxSettings:{dataType:"html"},debug:false};var j="appendTo",k="body";a.cluetip.setup=function(a){if(a&&a.insertionType&&a.insertionType.match(/appendTo|prependTo|insertBefore|insertAfter/)){j=a.insertionType}if(a&&a.insertionElement){k=a.insertionElement}}})(jQuery)