"use strict";
function createShaderProgram(gl)
{
	var VSHADER_SOURCE =
	  'attribute vec3 position;\n' +
	  'attribute vec3 normal;\n' +
	  'attribute vec2 texCoord;\n' +
	  'uniform mat4 projT,viewT,modelT,normalT;\n'+
	  'uniform vec3 eyePosition;\n'+ // World space coordinate or eye
	  'varying vec2 tCoord;\n'+
	  'varying vec3 fragPosition,fragNormal, fragViewDir;\n'+
	  'void main() {\n' +
	  '  fragPosition = (viewT*modelT*vec4(position,1.0)).xyz;\n' +
	  '  fragNormal = normalize((viewT*vec4(normal,0.0)).xyz);\n'+
	  '  fragViewDir = position.xyz - eyePosition;\n'+
	  '  tCoord = texCoord;\n'+
	  '  gl_Position = projT*viewT*modelT*vec4(position,1.0);\n' +
	  '}\n';

	// Fragment shader program
	var FSHADER_SOURCE =
	  'precision mediump float;\n'+
	  'uniform vec3 diffuseCoeff;\n'+
	  'uniform sampler2D diffuseTex;\n'+
	  'uniform samplerCube cubeTex;'+
	  'uniform vec3 eyePosition;\n' +
	  'varying vec2 tCoord;\n'+
	  'varying vec3 fragPosition,fragNormal, fragViewDir;\n'+
	  'void main() {\n' +
	  '	 float costheta = max(dot(normalize(-fragPosition),normalize(fragNormal)),0.0);\n'+
	 '  vec3 viewDir = normalize(fragViewDir);\n'+
	 '	vec3 normal = normalize(fragNormal);\n' +
	  '	vec3 reflectDirection = reflect(viewDir,normal);\n' +
	  ' vec3 texColor= textureCube(cubeTex, reflectDirection).rgb;\n' +
	  '  gl_FragColor = vec4(texColor*diffuseCoeff*costheta,1.0);\n' +
	  '}\n';
	var program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	if (!program) {
		console.log('Failed to create program');
		return false;
	}
	var attribNames = ['position','normal','texCoord'];
	program.attribLocations = {};
	var i;
	for (i=0; i<attribNames.length;i++){
		program.attribLocations[attribNames[i]]=gl.getAttribLocation(program, attribNames[i]);
	}
	var uniformNames = ['modelT', 'viewT', 'projT', 'normalT', 'diffuseCoeff', 'diffuseTex', 'cubeTex', 'eyePosition'];
	program.uniformLocations = {};
	
	for (i=0; i<uniformNames.length;i++){
		program.uniformLocations[uniformNames[i]]=gl.getUniformLocation(program, uniformNames[i]);
	}
	return program;
}
