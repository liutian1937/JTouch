<h1>jTouch</h1>

A javascript library for touch gestures .<br/>

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
var Touches = new jTouch(objTouch);//init jTouch
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

<blockquote>
http://liutian1937.github.io/jTouch/touch.html

Need translate.js album.js
</blockquote>

<blockquote>
http://liutian1937.github.io/jTouch/carousel.html

Need translate.js
</blockquote>


