// Brandon Forster, Matt Hansen, and Alex Horan
// CAP 4720 Project 3
// 26 November 2013

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
	  '  fragNormal = normalize((normalT*vec4(normal,0.0)).xyz);\n'+
	  '  fragViewDir = position.xyz - eyePosition;\n'+
	  '  tCoord = texCoord;\n'+
	  '  gl_Position = projT*viewT*modelT*vec4(position,1.0);\n' +
	  '}\n';

	// Fragment shader program
	var FSHADER_SOURCE =
	  'precision mediump float;\n'+
	  'uniform vec3 diffuseCoeff;\n'+
	  'uniform sampler2D diffuseTex;\n'+
	  'uniform samplerCube cubeTex;\n'+
	  'uniform vec3 eyePosition;\n' +
<<<<<<< HEAD
	  'uniform int drawType;\n'+	//0=shadow 1=reflection 2=texture
	  'varying vec2 tCoord;\n'+
	  'varying vec3 fragPosition,fragNormal, fragViewDir;\n'+
	  'void main() {\n' +
	  '	 vec4 texColor;\n' +
	  '	 vec3 refColor;\n' +
	  //'	 vec3 emission = uEmissionColor;\n' +
	  //'	 vec3 ambience = uAmbientReflectance * uSceneAmbient;\n' + 
	  '	 float costheta = 1.0;\n'+
	  '   vec3 viewDir = normalize(fragViewDir);\n'+
	  '	 vec3 normal = normalize(fragNormal);\n' +
	  '	 vec3 reflectDirection = reflect(viewDir,normal);\n' + 
	  //'	 vec3 tColor = vec3(emission + ambience + diffuse + specular);\n' +
	  //'	 tColor = vec3(emission + ambience + spotDifference * (diffuse));\n' +
	  '   if (drawType == 2){\n'+ //texture
	  '	 	texColor = texture2D(diffuseTex, vec2(tCoord.s, tCoord.t));\n' +
	  '	 	gl_FragColor = vec4(texColor.rgb*diffuseCoeff*costheta,1.0);\n' +
	  '	 }\n'+
	  '   if (drawType == 1){\n'+	//reflection
	  '	 	refColor = textureCube(cubeTex, reflectDirection).rgb;\n' +
	  ' 		gl_FragColor = vec4(refColor*diffuseCoeff*costheta,1.0);\n' +
	  '	 }\n'+
	  '	 else {\n' + //shadow
	  '		gl_FragColor = vec4(0.0,0.0,0.0,.95);\n' +
	  '	 }\n'+
=======
	  'uniform vec3 lightPosition;\n' +
	  'uniform int lightType;\n'+
	  'uniform float alpha;\n'+
	  'varying vec2 tCoord;\n'+
	  'varying vec3 fragPosition,fragNormal, fragViewDir;\n'+
	  'void main() {\n' +
	  '	 float costheta = max(dot(normalize(lightPosition),normalize(fragNormal)),0.0);\n'+
	 '  vec3 viewDir = normalize(fragViewDir);\n'+
	 '	vec3 normal = normalize(fragNormal);\n' +
	  '	vec3 reflectDirection = reflect(viewDir,normal);\n' +
	  ' vec3 texColor= texture2D(diffuseTex,tCoord).rgb;\n'+
	  // "regular" models
	  ' if (lightType == 0){\n'+
	  '		gl_FragColor = vec4(texColor*diffuseCoeff*costheta,1.0);\n' +
	  '	}\n'+
	  // projection shadow
	  '	else if (lightType == 1){\n' +
	  '		gl_FragColor = vec4(0.0,0.0,0.0,.98);\n' +
	  '	}\n'+
	  // reflected model
	  '	else if (lightType == 2){\n' +
	  '		gl_FragColor = vec4(texColor*diffuseCoeff*costheta,alpha);\n' +
	  '	}\n'+
	  // normal mapped surface
	  '	else if (lightType == 3){\n' +
	  '		gl_FragColor = vec4(texColor*diffuseCoeff,1.0);\n' +
	  '	}\n'+
>>>>>>> origin/Brandon-
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
<<<<<<< HEAD
	var uniformNames = ['modelT', 'viewT', 'projT', 'normalT', 'diffuseCoeff', 'diffuseTex', 'cubeTex', 'eyePosition', 'drawType'];
=======
	var uniformNames = ['modelT', 'viewT', 'projT', 'normalT', 'diffuseCoeff', 'diffuseTex', 'cubeTex', 'eyePosition', 'lightType', 'alpha', 'lightPosition'];
>>>>>>> origin/Brandon-
	program.uniformLocations = {};
	
	for (i=0; i<uniformNames.length;i++){
		program.uniformLocations[uniformNames[i]]=gl.getUniformLocation(program, uniformNames[i]);
	}
	return program;
}
