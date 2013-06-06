<h1>JTouch</h1>
<p>
A javascript library for touch gestures .<br/>
Please check the demo on your tablet device .
</p>
<p>
<img src="http://liutian1937.github.io/JTouch/images/jtouch.jpg" /></p>
<h2>Support gestures (One Or Two Fingers)</h2>
<ul>
  <li>start,end</li>
  <li>tap,doubletap,longtap,hold</li>
  <li>flip,swipe</li>
  <li>pinch,rotate</li>
</ul>

<h2>Usage</h2>
<pre>
var objTouch = document.getElementById('touch');//get object
var Touches = JTouch(objTouch);//init JTouch
Touches.on('start',function(){
		  console.log('start');
	  }).on('end',function(){
		  console.log('end');
	  });


Touches.on('flip',function(evt,data){
	console.log('flip');
	switch(data['direction']){
		case 'left' :
			Trans.next();
			break;
		case 'right':
			Trans.prev();
			break;
		}
	});

</pre>

<h2>Demo</h2>

You can check it on your tablet device . (ipad,surface..)
<blockquote>
<a href="http://liutian1937.github.io/JTouch/touch.html" target="_blank">http://liutian1937.github.io/JTouch/touch.html</a>

Need translate.js album.js
</blockquote>

<blockquote>
<a href="http://liutian1937.github.io/JTouch/carousel.html" target="_blank">http://liutian1937.github.io/JTouch/carousel.html</a>

Need translate.js
</blockquote>


