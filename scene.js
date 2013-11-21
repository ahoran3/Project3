// Jonathan Cools-Lartigue, Brandon Forster
// Matt Hansen, Alex Horan
// CAP 4720- Project 1
// 24 September 2013

function renderableScene(gl, program, model_name, N)
{

    this.model = new JsonRenderable(gl, program, model_name,"model.json"); //RenderableModel(gl,modelObject);

	this.delta = Math.max(
	   	this.model.bounds_max[0]-this.model.bounds_min[0],
	   	this.model.bounds_max[1]-this.model.bounds_min[1],
		this.model.bounds_max[2]-this.model.bounds_min[2]
		);
	this.center = [
	     0.5*(this.model.bounds_max[0]+this.model.bounds_min[0]),
	     0.5*(this.model.bounds_max[1]+this.model.bounds_min[1]),
		0.5*(this.model.bounds_max[2]+this.model.bounds_min[2])
	];

	this.sceneBounds={};
	this.sceneBounds.min = [thisbounds.min[0],thisbounds.min[1],thisbounds.min[2]]; // clone
	this.sceneBounds.max = [
		this.model.bounds_min[0]+N[0]*this.delta,
	     this.model.bounds_min[1]+N[1]*this.delta,
		this.model.bounds_min[2]+N[2]*this.delta
	];
	// this.projMatrix = camera.getProjMatrix();
	this.camera = new Camera(gl,this.sceneBounds,[0,1,0]);

	return this.model;
}