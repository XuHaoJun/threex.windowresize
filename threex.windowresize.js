// This THREEx helper makes it easy to handle window resize.
// It will update renderer and camera when window is resized.
//
// # Usage
//
// **Step 1**: Start updating renderer and camera
//
// ```var windowResize = new THREEx.WindowResize(aRenderer, aCamera)```
//    
// **Step 2**: stop updating renderer and camera
//
// ```windowResize.destroy()```
// # Code

//

/** @namespace */
var THREEx	= THREEx || {}

/**
 * Update renderer and camera when the window is resized
 * 
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
 * @param {Object} opts various settings for the window resizer
*/
THREEx.WindowResize	= function(renderer, camera, opts){

	opts		= opts		|| {}
	opts.width	= opts.width	|| function(){ return window.innerWidth }	// {Function} width getter
	opts.height	= opts.height	|| function(){ return window.innerHeight }	// {Function} height getter
	opts.maxWidth	= opts.maxWidth	|| null						// {Number} limit the width of the renderer
	opts.maxHeight	= opts.maxHeight|| null						// {Number} limit the height of the renderer
	opts.before	= opts.before	|| null						// {Function} callback before resize happened
	opts.after	= opts.after	|| null						// {Function} callback after resize happened
	opts.scale	= opts.scale	|| 'default'					// {String} 3d || 2d || default

	// get css prefix (only needed for scale 3d/2d
	var prefix = (function (name) {
		var style = window.getComputedStyle(document.documentElement, '')
		var cssPrefixes = ["Webkit", "O", "Moz", "ms"]
		if (!(name in style)) {
			var capName = name.charAt(0).toUpperCase() + name.slice(1)
			for(var i = 0; i < cssPrefixes.length; i++) {
				if ((cssPrefixes[i] + capName) in style) {
					return '-' + cssPrefixes[i].toLowerCase() + '-'
				}
			}
		}
		return ''
	})('transform');

	// resize callback
	var callback = function(){
		if(opts.before) opts.before()

		var width	= opts.width()
		var height	= opts.height()
		var maxWidth	= opts.maxWidth && opts.maxWidth < width ? opts.maxWidth : width
		var maxHeight	= opts.maxHeight && opts.maxHeight < height ? opts.maxHeight : height
		
		// notify the renderer of the size change
		renderer.setSize( maxWidth, maxHeight, false )

		// scale to window size
		renderer.domElement.style.cssText = ''
		if(opts.scale === '3d') {
			renderer.domElement.style[prefix + 'transform'] = 'scale3d(' + width/maxWidth + ',' + height/maxHeight + ',1)'
			renderer.domElement.style[prefix + 'transform-origin'] = 'left top'
		} else if(opts.scale === '2d') {
			renderer.domElement.style[prefix + 'transform'] = 'scale(' + width/maxWidth + ',' + height/maxHeight + ')'
			renderer.domElement.style[prefix + 'transform-origin'] = 'left top'
		} else if(opts.scale === 'default') {
			renderer.domElement.style.width	 = width + 'px'
			renderer.domElement.style.height = height + 'px'
		}

		// update the camera
		camera.aspect  = width / height
		camera.updateProjectionMatrix()

		if(opts.after) opts.after()
	}

	// bind the resize event
	window.addEventListener('resize', callback, false)

	// return .stop() the function to stop watching window resize
	return {
		trigger	: function(){
			callback()
		},
		option	: function(key, value){
			opts[key] = value
			callback()
		},
		/**
		 * Stop watching window resize
		*/
		destroy	: function(){
			window.removeEventListener('resize', callback)
		}
	}
}