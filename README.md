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
<blockquote>
var objTouch = document.getElementById('touch');//get object<br/>
var Touches = new jTouch(objTouch);//init jTouch<br/>
Touches.on('start',function(){<br/>
		  console.log('start');<br/>
	  }).on('end',function(){<br/>
		  console.log('end');<br/>
	  });
<blockquote>
