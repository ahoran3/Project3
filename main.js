// Brandon Forster, Matt Hansen, and Alex Horan
// CAP 4720 Project 3
// 26 November 2013

"use strict";
//This function gets called when reading a JSON file. It stores the current xml information.

var ModelFlag = true;
var changeEnvironmentFlag = false;
var rotateFlag = true;
var dollyRequired = 0;
var activeModels = new Array();
var angle = 0;
var lightPosX= 1;
var lightPosY= 1;
var lightPosZ= 1;
function toggleRotateFlag(){rotateFlag = !rotateFlag;}

var texCubeObj;

function main(){
    //set teapot to default model
    //document.getElementById("checkbox_house").checked = true;
    activeModels.push("floor");
    //activeModels.push("teapot");
    // ... global variables ...
    var gl, model, camera, program, reflectionMatrix, shadowProjMatrix;
    var canvas = null;
    var messageField = null;
	
    canvas = document.getElementById("myCanvas1");
    addMessage(((canvas)?"Canvas acquired":"Error: Can not acquire canvas"));
    var gl = canvas.getContext("experimental-webgl", {stencil:true});
		
    program=createShaderProgram(gl);

    texCubeObj = loadCubemap(gl,'lib/skybox/', ['posx.jpg','negx.jpg','posy.jpg','negy.jpg','posz.jpg','negz.jpg']);
    if(texCubeObj == null){
        console.log("problem loading the Environment.");
    }

    gl.clearColor(0,0,0,1);
    draw();
    return 1;
    function draw(){
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT ); 
		gl.useProgram(program);
	
        if (ModelFlag)
		{
            console.log("model flag triggered!\n");
            model = addNewModel();
            ModelFlag = false;
		}    

        if (changeEnvironmentFlag)
        {
            chooseEnvironment(document.getElementById('environmentList').value);
            changeEnvironmentFlag = false;
        }
		
        if (dollyRequired)
        {
            camera.dolly(0.05*dollyRequired);
            dollyRequired=0;
        }
		
        var projMatrix = camera.getProjMatrix();
        gl.uniformMatrix4fv(program.uniformLocations["projT"], false, projMatrix.elements);
        var viewMatrix = camera.getRotatedViewMatrix(angle);
        gl.uniformMatrix4fv(program.uniformLocations["viewT"], false, viewMatrix.elements);
		
		gl.depthMask(false);
		
		//compute a model matrix to translate the floor
		var floorMMatrix = new Matrix4();
		var floorOffset= [0,2,0];
		
		gl.enable(gl.STENCIL_TEST);
		gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
		gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
		model[0].draw(floorMMatrix, floorOffset);

		gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
		gl.stencilFunc(gl.EQUAL, 1, 0xFF);

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		
		model[0].draw(floorMMatrix, floorOffset); //TODO draw with alpha
		
		gl.depthMask(true);
		
		for(var i=1;i<model.length;i++)
		{
            // Q is any point on the mirror plane
			// N is the normal to the mirror plane
			var Q= [0,model[i].getBounds().min[1],0,1];
			var N= [0,1,0,0];
			var L= [lightPosX,lightPosY,lightPosZ,0];
			reflectionMatrix = computeReflectionMatrix(Q, N);
			shadowProjMatrix = computeShadowProjectionMatrix(Q,N,L);
			
			model[i].draw(reflectionMatrix);
            model[i].draw(shadowProjMatrix, null, true);
		}

		gl.disable(gl.BLEND);
		gl.disable(gl.STENCIL_TEST);
		gl.enable(gl.DEPTH_TEST);

		gl.useProgram(program);
        
        for(var i=1;i<model.length;i++)
            model[i].draw();
		
        gl.useProgram(null);

       if (rotateFlag){angle++; if (angle > 360) angle -= 360;}
       window.requestAnimationFrame(draw);
    }

    //function looks through possible models and decides which ones need to be rendered on the canvas. 
    //Returns a list of models to be rendered for the draw function.
    function addNewModel()
    {
        //decides which models to put in the Active models array
        function getActiveModels()
        {
            var elem_spot = activeModels.indexOf("teapot");
            //if model is checked and it does not already exist in the active models list, add it.
            if(document.getElementById("checkbox_teapot").checked == true && elem_spot == -1){
                activeModels.push("teapot");
                console.log ("adding teapot");
            }
            if(document.getElementById("checkbox_teapot").checked == false && elem_spot != -1){
                activeModels.splice(elem_spot, 1);
                console.log ("deleting teapot");
            }

            //SKULL
            elem_spot = activeModels.indexOf("skull");
            if(document.getElementById("checkbox_skull").checked == true && elem_spot == -1){
                activeModels.push("skull");
                console.log ("adding skull");
            }
            if(document.getElementById("checkbox_skull").checked == false && elem_spot != -1){
                activeModels.splice(elem_spot, 1);
                console.log ("deleting skull");
            }

            //HOUSE
            elem_spot = activeModels.indexOf("house");
            if(document.getElementById("checkbox_house").checked == true && elem_spot == -1){
                activeModels.push("house");
            }
            if(document.getElementById("checkbox_house").checked == false && elem_spot != -1){
                activeModels.splice(elem_spot, 1);
                console.log ("deleting house");
            }

            //CUBE
            elem_spot = activeModels.indexOf("cube");
            if(document.getElementById("checkbox_cube").checked == true && elem_spot == -1){
                activeModels.push("cube");
            }
            if(document.getElementById("checkbox_cube").checked == false && elem_spot != -1){
                activeModels.splice(elem_spot, 1);
                console.log ("deleting cube");
            }

            console.log (activeModels.length + " active models: ");
            for(var i=0; i < activeModels.length; i++)
                console.log("\t" + activeModels[i] + " at index " + i);
            if(activeModels.length == 0)
                addNewModel();
            return activeModels;
        }

        //puts a the current model name with the path and generates a Json Renderable
        //Returns the renderable for that model if it was successful.
        function getActiveModelPaths(model_name)
        {
            var model = new JsonRenderable(gl,program, model_name,"model.json");
            if (!model){
                console.log ("No model could be read");
                return;
            }
            else
                return model;
        }

        var currModel = getActiveModels();
        model = new Array();

        //loops through all active models
        for(var i=0; i < currModel.length; i++)
        {
            model.push(getActiveModelPaths(currModel[i]));

            var bounds = model[i].getBounds();
            camera = new Camera(gl,program,bounds,[0,1,0]);
            var newEye=camera.getRotatedCameraPosition(angle);
            gl.uniform3f(program.uniformLocations["eyePosition"],newEye[0],newEye[1],newEye[2]);
        }
        //return a list of all active JSON renderables for Draw.
        return model;
    }

    function chooseEnvironment(choice)
    {
        console.log ("chose" + choice);
        texCubeObj = loadCubemap(gl,'lib/'+choice+'/', ['posx.jpg','negx.jpg','posy.jpg','negy.jpg','posz.jpg','negz.jpg']);
    }

	function loadCubemap(gl, cubemappath, texturefiles) 
    {
        var tex = gl.createTexture();
        tex.complete = false;
        loadACubeFaces(tex,cubemappath, texturefiles);
        return tex;
    }

    function isPowerOfTwo(x) {
        return (x & (x - 1)) == 0;
    }
    function nextHighestPowerOfTwo(x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    }
    function loadACubeFaces(tex,cubemappath, texturefiles) 
    {
        var imgs = [];
        var count = 6;
        for (var i=0; i<6;i++){
            var img = new Image();
            imgs[i] = img;
            img.onload = function() {
                if (!isPowerOfTwo(img.width) || !isPowerOfTwo(img.height)) 
                {
                    // Scale up the texture to the next highest power of two dimensions.
                    var canvas = document.createElement("canvas");
                    canvas.width = nextHighestPowerOfTwo(img.width);
                    canvas.height = nextHighestPowerOfTwo(img.height);
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    img = canvas;
                }
                count--; 
                if (count==0){
                    tex.complete = true;
                    var directions =[
                        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
                    ];
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE); 
                    for (var dir=0;dir<6;dir++)gl.texImage2D(directions[dir], 0, gl.RGBA,gl.RGBA, gl.UNSIGNED_BYTE, imgs[dir]);
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
                }
            }
            imgs[i].src = cubemappath+texturefiles[i];
        }
    }
	// Q is any point on the mirror plane
	// N is the normal to the mirror plane
	function computeReflectionMatrix(Q, N)
	{
		var NdotQ = N[0]*Q[0]+N[1]*Q[1]+N[2]*Q[2];
		
		var reflectionMatrix = new Matrix4();
		reflectionMatrix.elements = new Float32Array([
			1-2*N[0]*N[0],	-2*N[1]*N[0],	-2*N[2]*N[0],	0,
			-2*N[0]*N[1],	1-2*N[1]*N[1],	-2*N[2]*N[1],	0,
			-2*N[0]*N[2],	-2*N[1]*N[2],	1-2*N[2]*N[2],	0,
			2*NdotQ*N[0],	2*NdotQ*N[1],	2*NdotQ*N[2],	1 ]);
			
		return reflectionMatrix;
	}

	// Q is a known point on the plane on which shadow will be cast
	// N is the normal to the plane
	// L is a 4 element array representing the light source, whose 4th element is 1 if the light source is a point source and 0 if the light source is a directional source.
	function computeShadowProjectionMatrix(Q,N,L)
	{
		var NdotQ = N[0]*Q[0]+N[1]*Q[1]+N[2]*Q[2];
		var NdotL = N[0]*L[0]+N[1]*L[1]+N[2]*L[2];
		var D = NdotL-((L[3]>0)?NdotQ:0);
		var shadowMatrix = new Matrix4();
		shadowMatrix.elements = [
			D-N[0]*L[0],	-N[0]*L[1],		-N[0]*L[2], 	-N[0]*L[3], 
			-N[1]*L[0], 	D-N[1]*L[1],	-N[1]*L[2], 	-N[1]*L[3],
			-N[2]*L[0],		-N[2]*L[1], 	D-N[2]*L[2], 	-N[2]*L[3],
			NdotQ*L[0], 	NdotQ*L[1], 	NdotQ*L[2], 	NdotL
			];
		if (shadowMatrix.elements[15] < 0)
		{
			for(var i=0; i<16;i++)
			{
				shadowMatrix.elements[i] = -shadowMatrix.elements[i];
			}
		}
		return shadowMatrix;
	}
}

function addMessage(m){
		console.log(m);
}