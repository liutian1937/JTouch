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

<strong>OR</strong>
</pre>
