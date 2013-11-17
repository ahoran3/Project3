function addMessage(m){
		console.log(m);
}
function createQuadProgram(gl)
{
	gl.clearColor(0,0,0,1);	

	  // Vertex shader program
		var VSHADER_SOURCE =
		  'attribute vec3 position;\n' +
		  'attribute vec2 texCoord;\n' +
		  'varying vec2 tCoord;\n'+
		  'void main() {\n' +
		  '  gl_Position = vec4(position,1.0);\n' +
		  '	 tCoord = texCoord;\n'+
		  '}\n';

		// Fragment shader program
		var FSHADER_SOURCE =
		  'precision mediump float;\n'+
		  'uniform sampler2D tex;\n'+
		  'uniform float alpha;\n' +
		  'varying vec2 tCoord;\n'+
		  'void main() {\n' +
		  '  vec3 color = texture2D(tex, tCoord).rgb;\n'+
		  '  gl_FragColor = vec4(color, alpha);\n' +
		  '}\n';

	  // Create the Program from the shader code.
	var program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	if (!program) {
		addMessage('Failed to create program');
		return false;
	}
	else addMessage('Shader Program was successfully created.');
	
	return program;
}

function Quad(gl, program, bounds)
{
	var vertices = new Float32Array(
		[ -1.0, 0,		1.0, 0,		1.0, -.75,  	 // Triangle 1
          -1.0, 0,		1.0,-0.75,	-1.0,-0.75]); // Triangle 2
		
	var tCoordinates = new Float32Array(
		[ 0, 1.0,	1.0, 1.0,	1.0,0,  	 // Triangle 1
          0, 1.0,	1.0,   0,	  0,0]); // Triangle 2
	// Get the location/address of the vertex attribute inside the shader program.
	var a_Position = gl.getAttribLocation(program, 'position');	  
	var a_TexCoord = gl.getAttribLocation(program, 'texCoord');	
	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Position); 
	gl.enableVertexAttribArray(a_TexCoord); //TODO this line make it stop drawing the square
	var samplerLoc = gl.getUniformLocation(program, 'tex');
	var alphaLoc = gl.getUniformLocation(program, 'alpha');

	// Create a buffer object
	var vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) 
	{
		addMessage('Failed to create the buffer object');
		return null;
	}
	// Bind the buffer object to an ARRAY_BUFFER target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// Write date into the buffer object
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	
	var tcBuffer = gl.createBuffer();
	if (!tcBuffer) 
	{
		addMessage('Failed to create the buffer object');
		return null;
	}
	// Bind the buffer object to an ARRAY_BUFFER target
	gl.bindBuffer(gl.ARRAY_BUFFER, tcBuffer);
	// Write date into the buffer object
	gl.bufferData(gl.ARRAY_BUFFER, tCoordinates, gl.STATIC_DRAW);
	

	gl.useProgram(program);

	
	function createTexture(imageFileName)
	{
	  var tex = gl.createTexture();
	  var img = new Image();
	  console.log(imageFileName)
	  img.onload = function(){
		  console.log("data ready");
		  tex.complete = img.complete;
		  gl.bindTexture(gl.TEXTURE_2D, tex);
		  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
		  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		  gl.bindTexture(gl.TEXTURE_2D, null);
	  }
	  img.src = imageFileName;
	  return tex;
	}
	var imageFile = 'lib/texture.jpg';
	var tex=createTexture(imageFile);

	this.draw= function(alpha)
	{
		if (alpha)
		{
		  gl.uniform1f(alphaLoc, alpha);
		}
		else
		{
		  gl.uniform1f(alphaLoc, 1.0);
		}
	
		// Bind the buffer object to target
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		// Assign the buffer object to a_Position variable
		gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, tcBuffer);
		gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
		if (tex.complete)
		{
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D,tex);
			gl.uniform1i(samplerLoc,0);

			gl.drawArrays(gl.TRIANGLES, 0, 6);
		}
	}
}