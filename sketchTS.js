/*
TO DO

[1.] Ensure Node constructor is in fact building multiple children
[2.] alter tetherUpdate2 so it exerts force on the tether (based on difference between velocity before and after conversion to angular velocity)
[2. a.] figure out what the deal is with the relative forces of oscillation and wind
[2. b.] run wind on a unversally accessible multiplier
3. Build tree display function
	 [a.] more realistic Node constructor
	 b. leaves (NOT YET)

3.1. Troubleshoot tetherTo and untether functions
	NB: uncomment the transfer of vel from the parent to fix tree motion
	NB: making a new 'tetherUpdate' to trouble issue where newly tethered mover swings in the wrong direction




3.5. Move functions outside mover/junction class? Have a class for Tree, Grass, and Mover? So Tree is just a stack of tethered movers?
4. Build grass display function
5. change gravity to be dependent on a Movers weight
6. Build bugs
7. AESTHETICALLY - translucent shapes on black background - esp flowers
8. Put off 'bouncing twig' physics - it's not necessary for this build

*/



var wind;
var up = true;
var right = true;

var heading = 0;
var windStrength = 0.1; //change this to globally alter wind strength (imagine this is 'air density')
var gravStrength = 0.1; //multiplies the effect of gravity
var tension = 1; //change this to globally alter angular tension (i.e. tree branches 'swinging back')
var grassDensity = 1;


var testFireflies;
var testTree;
//var gravity;




function setup() {
	smooth();

	createCanvas(400, 400);
	background(0);

	wind = createVector (0,0);
	//gravity = createVector(0,1);

	bouncyBoy = new Mover(width/2,height/4,2,0,100, 40);
	bouncyBoy2 = 	new Mover(width/2,height/2,-2, 0,100, 40);
	//bouncyBoy.tetherTo(bouncyBoy2); 

	testGrass = new Node (3*width/4, height, 0, PI, 250, 12); 

	testGrasses = Array();
	for(i = 0; i < 0; i++){
		testGrasses[i] = new Node(random(0,width), height, 0, PI, 5, random(11,18));
	}

	
};


function draw () {
	background(0,20);


	stroke(255,255,255);
	strokeWeight(0.5);
	
	for(i=50; i<width; i += 50){
		line(i,0,i,height);
		line(0,i,width,i);
		for(x=50; x<height; x += 50){
			text(i + ", " + x, i+5, x+5)
		};

	};

	/*
	if(keyIsPressed){
		if(bouncyBoy.tethered){
			bouncyBoy.untether();
		}else{
			bouncyBoy.tetherTo(bouncyBoy2);
		};

	};*/

	stroke(150,150,0);

	var dist = bouncyBoy2.pos.dist(bouncyBoy.pos);
	var angleTo = atan2(bouncyBoy.pos.y-bouncyBoy2.pos.y, bouncyBoy.pos.x-bouncyBoy2.pos.x);

	push();
	translate(bouncyBoy2.pos.x, bouncyBoy2.pos.y);
	line(0,0, dist*cos(angleTo), dist*sin(angleTo));
	pop();

	//bouncyBoy2.update();
	//bouncyBoy2.applyWind();
	bouncyBoy2.show();
	if(bouncyBoy2.tethered == false){
		bouncyBoy2.edgeCollide();
	};

	bouncyBoy.update();
	bouncyBoy.applyWind();
	bouncyBoy.show();
	if(bouncyBoy.tethered == false){
		bouncyBoy.edgeCollide();
	};



	blow();



};

function mousePressed() {
		right = !right;
};

function keyPressed (){

	//heading += PI/60;
	print("heading = " + heading);
	

	if(bouncyBoy.tethered == false){
		bouncyBoy.tetherTo(bouncyBoy2);
	}else{
		bouncyBoy.untether();
	};
	

};

function blow(){
	if(right){
		if (wind.x > 1){
				up = false;
			}else if(wind.x<0){
				up = true;
			}


		if(up){
			wind.x+= 0.01;
		}else{
			wind.x -= 0.01;	
		};


	}else{


		if (wind.x < -1){
				up = false;
			}else if(wind.x > 0){
				up = true;
			}


		if(up){
			wind.x -= 0.01;			
		}else{
			wind.x += 0.01;
		}
	}

	//print(wind.x); //manages the wind
};



//physics object class
function Mover (x, y, vx, vy, w, sc, t) {


	//basic physics variables	
	this.pos = createVector(x, y); 
	this.vel = createVector (vx, vy);
	this.accel = createVector (0,0);  
	this.weight = w;
	this.scale = sc;

	//tethering variables
	this.tethered = false; //boolean that tracks whether THIS mover is tethered
	this.tether; //refers to the 'parent' or 'tether' from which the mover swings
	this.radius; //the constant distance the mover maintains from its tether
	this.angle; //current angle between tether and mover
	this.origAng; //original angle between tether and mover - this is remembered to simulate rotational tension
	this.angVel = 0;
	this.rotAccel = 0;
	this.tethers = new Array(); //contains the movers' tethers/children

	this.tetherTo = function(t) { //this function tethers an untethered mover to a new tether (t must be a mover)
		if(this.tethered == false){
			this.tethered = true;
			this.tether = t; //t must be a mover!
			this.radius = this.pos.dist(t.pos);
			this.origAng = atan2(this.pos.y-t.pos.y, this.pos.x-t.pos.x);
			this.angle = this.origAng;
			this.angVel = ((this.vel.x*-sin(this.angle)+this.vel.y*cos(this.angle))/this.radius);
			t.tethers.push(this);
		};
	};


	if(t instanceof Mover){
		this.tetherTo(t);
	};

	this.untether = function(){
		if(this.tethered){
			this.tether.tethers.pop();
			this.tethered = false;
			this.tether = null;
		};
	};

	//------TETHERING FUNCTIONS-----------



	this.update = function(){
		if(this.tethered){
			this.angVel += this.rotAccel;
			this.rotAccel = 0;
			this.accel.set(0,0);
			this.angle += this.angVel;
			var pass =  createVector(-this.pos.x, -this.pos.y);
			this.pos.set(this.tether.pos.x+cos(this.angle)*this.radius, this.tether.pos.y+sin(this.angle)*this.radius);
			pass.add(this.pos);
			this.vel.set(pass);
			
		}else{
			this.vel.add(this.accel);
			this.accel.set(0,0);
			this.pos.add(this.vel);
		};
	};

	


	this.angular = function (){ //enacts angular tension on the mover (eg for tree branches)
		var toward = createVector(this.tether.pos.x+cos(this.origAng)*this.radius, this.tether.pos.y+sin(this.origAng)*this.radius);
		var f = p5.Vector.sub(toward, this.pos);
		
		//draws a line to the point towards which this function is returning the mover 

		/*stroke(255,225,50);
		line(this.pos.x, this.pos.y, toward.x, toward.y);
		noStroke(); 
		*/
		
		f.mult(this.scale/*f.mag()*/*tension);
		f.div(this.radius);
		this.applyForce(f);

		//this.tethers.map( (c) => c.angular());
	};

	//----------KEYBOARD CONTROL------------

	this.control = function () { //puts the mover under control of the keyboard
		if(keyIsDown(LEFT_ARROW)){
			this.vel.x -= .8;
		};
		if(keyIsDown(RIGHT_ARROW)){
			this.vel.x += .8;
		};
		if(keyIsDown(UP_ARROW)){
			this.vel.y -= .8;
		};
		if(keyIsDown(DOWN_ARROW)){
			this.vel.y += .8;
		};
	};

	//-------SHARED PHYSICS--------

	this.applyForce = function (force) {
		if(this.tethered){
			print(force.x);
			var rotF = force.x*-sin(this.angle)+force.y*cos(this.angle);
			this.rotAccel += rotF/(this.weight*this.radius);
			var tetherF = createVector(force.x*cos(this.angle), force.y*sin(this.angle));
			this.tether.applyForce(tetherF);
		}else{
			var f = p5.Vector.div(force,this.weight);
			this.accel.add(f);
		};
		/*
		//line for troubleshooting velocity	
		stroke(255,225,50);
		line(this.pos.x, this.pos.y, this.pos.x+(10*this.vel.x), this.pos.y+(10*this.vel.y));
		noStroke(); 
		*/
	};	

	this.edgeCollide = function () { //bounces off the edges of the canvas
		if ((this.pos.x<=0 && this.vel.x<0)||(this.pos.x>=width && this.vel.x>0)) {
			this.vel.x=this.vel.x*-1;
		};

		if ((this.pos.y<=0 && this.vel.y<0)||(this.pos.y>=height && this.vel.y>0)) {
			this.vel.y=this.vel.y*-1;

		};
	};

	this.edgeUpdate = function(){ //this function is intended to avoid movers getting 'stuck outside' - they should stop on the side of the canvas
		this.vel.add(this.accel);
		this.accel.set(0,0);
		if ((this.pos.x<=0 && this.vel.x<0)||(this.pos.x>=width && this.vel.x>0)) {
			this.vel.x=this.vel.x*-1;
		};

		if ((this.pos.y<=0 && this.vel.y<0)||(this.pos.y>=height && this.vel.y>0)) {
			this.vel.y=this.vel.y*-1;

		};
		this.pos.add(this.vel);
	};


	this.applyWind = function () {  //this is a globally available function to apply the wind speed to the mover in a more realistic way, as though it were air.
		var effectOfWind = p5.Vector.sub(wind,this.vel);
		effectOfWind.mult(windStrength);
		effectOfWind.mult(effectOfWind.mag());
		this.applyForce(effectOfWind);

		//this.tethers.map( (c) => c.applyWind());
	};

	this.gravity = function () {
		gravity = createVector (0,gravStrength*this.weight);
		this.applyForce(gravity);

		//this.tethers.map( (c) => c.gravity());
	};

	//---------DISPLAY------------


	this.show = function () { //displays physics object as a firefly
		stroke(color(255, 220, 50));
		strokeWeight(1);
		fill(color(255, 150));
		ellipse(this.pos.x, this.pos.y, 4, 4);
		ellipse(this.pos.x, this.pos.y, 1, 1);
		noStroke();  	
	};

	//--------FIREFLIES------------

	this.updateFireflies = function(){
		if(this.tethered){
			this.tetherUpdate2();
		}else{
			this.update();
		};


		this.tethers.map(  (c) => c.updateTree()  );
	};

	this.random = function () {
		this.vel.x += random(-0.1,0.1);
		this.vel.y += random(-0.1,0.1);

		this.tethers.map( (c) => c.random());
	};

	//--------TREE-----------------

	this.buildTree = function () {
		if (this.scale > 10){

			//establish number of children
			var maxChildren;

			if(/*this.tethered && */random(0,100)<85){
				maxChildren = 2;
			}else{
				maxChildren = 1;	
			};

			//establish starting angle

			var ang;

			if(this.tethered){
				ang=PI-this.angle;
			}else{
				ang=PI;
			};

			//print("maxChildren " + maxChildren);
			//print("angle: " + degrees(ang));

			for(i=0; i<maxChildren; i++){
				
				if(maxChildren>1){
					var newAng = ang-PI/8+i*PI/4+random(-PI/15, PI/15)+random(-PI/15, PI/15);
				}else{
					var newAng = PI+random(-PI/30, PI/30)+random(-PI/30, PI/30);
				};

				var xCoOrd = this.pos.x + this.scale*sin(newAng);
				var yCoOrd = this.pos.y + this.scale*cos(newAng);
				child = new Mover(xCoOrd, yCoOrd, 0, 0, this.weight*0.9, this.scale*(random(0.6,0.85)), this); //by altering the last two numbers you can alter the shapes
				//print("Parent scale: " + this.scale + " and child scale: " + child.scale);
				//print(degrees(child.angle));
				//print(degrees(atan2(this.pos.y-child.pos.y, this.pos.x-child.pos.x)));
				
			};

			for(i=0; i<this.tethers.length; i++){
				if(this.tethers[i].scale>10){this.tethers[i].buildTree();};
			};
			//};
		};

		//print("tethers length: " + this.tethers.length);
	};

	this.updateTree = function (){

		if(this.tethered){
			this.tetherUpdate2();
		};

		this.tethers.map(  (c) => c.updateTree()  );
	};

	this.showTree = function (){
		stroke(255, 50);
		strokeWeight(this.scale/20);

		for(var i = 0; i < this.tethers.length; i++){

			
			line(this.pos.x, this.pos.y, this.tethers[i].pos.x, this.tethers[i].pos.y); 
		};
		
		noStroke();
		
		//fill(255,50);
		//textSize(12);
		//text(this.scale, this.junction.pos.x, this.junction.pos.y);

		this.tethers.map( (t) => t.showTree());


		//this.fireflies();
	};
};

function Node (x, y, n, theta, w, sc) {
	/*
	x = starting x coordinate
	y = starting y coordinate
	theta = current angle
	n = tracks how many 'layers' deep the node is (i.e. root of the tree is 0, first juncture is 1)
	w = current weight
	sc = current scale
	*/

	this.junction = new Mover(x, y, 0, 0, w, sc);
	this.children = new Array();
	this.leaves = new Array();
	this.recurse = false;
	this.scale = sc;
	this.lat = x;
	this.long = y;
	this.weight = w;
	this.angle = theta;
	this.count = n;

	var maxChildren;

	if(this.count>0 && random(0,100)<85){
		maxChildren = 2;
	}else{
		maxChildren = 1;	
	};

	if(this.scale>10){				
		for(var i = 0; i < maxChildren; i ++){

			if(maxChildren>1){
				//var newAng = this.angle+random(-PI/3, PI/3);
				var newAng = this.angle-PI/8+i*PI/4+random(-PI/15, PI/15)+random(-PI/15, PI/15);
			}else{
				var newAng = this.angle+random(-PI/30, PI/30)+random(-PI/30, PI/30);
			}
			var xCoOrd = this.lat + this.scale*sin(newAng);
			var yCoOrd = this.long + this.scale*cos(newAng);
			this.children[i] = new Node(xCoOrd, yCoOrd, this.count+1, newAng, this.weight*0.9, this.scale*(random(0.6,0.85))); //by altering the last two numbers you can alter the shapes
			this.children[i].recurse = true;
			this.children[i].junction.tetherTo(this.junction);					
		};
	}else{ //this should spawn leaves eventually
		/*for(var i = 0; i < 4; i ++){
				var newAng = this.angle-3*PI/2+i*3*PI/4;//+random(-PI/20, PI/20)+random(-PI/20, PI/20);
			
			var xCoOrd = this.lat + this.scale*sin(newAng);
			var yCoOrd = this.long + this.scale*cos(newAng);
			this.children[i] = new Node(xCoOrd, yCoOrd, this.maxN-1, this.count+1, newAng, 10, 8);
			this.children[i].recurse = true;
			this.children[i].junction.tetherTo(this.junction);
		};*/
	};




	this.update = function(){

		if (this.recurse){
			this.junction.tetherUpdate2();
		}
 

		this.children.map(  (c) => c.update()  ); 
		//this.children.map(  function(c) {c.update();}  );

		// for(var i = 0; i < this.children.length; i++){
		// 	this.children[i].update();	
		// } ;		
		
	};


	this.edgeUpdate = function(){
		if (this.recurse){
			this.junction.edgeTetherUpdate();
		}

		this.children.map(    (c) => c.edgeUpdate()		);
	};

	this.nodeShow = function(){
		this.junction.show();

		for(var i = 0; i < this.children.length; i++){
			this.children[i].nodeShow();
			stroke(255,225,50);
			line(this.junction.pos.x, this.junction.pos.y, this.children[i].junction.pos.x, this.children[i].junction.pos.y);
			noStroke();
		};
	};

	this.fireflies = function (){
		this.junction.show();
		for(var i = 0; i < this.children.length; i++){
			this.children[i].fireflies();
			};
	};

	this.grass = function () {
		fill(150, 240, 210, 20);
		var pass = this.scale/5;
		var posPass = this.junction.pos.x;
		
		push();

		for(j = 0; j<grassDensity; j++){
			translate((-1^j*j*-15)%width,0);
			//print((-1^j*j*-15)%width);

			for (var i = 0; i < this.children.length; i++){
			
			//var xP = (this.junction.pos.x+this.chlidren[i].junction.pos.x)/2;
			//var yP = (this.junction.pos.y+this.chlidren[i].junction.pos.y)/2;
		      	
		      	beginShape();
		      	
		      	vertex(this.junction.pos.x-pass/2, height);//bottom left hand corner of the triangle
		      	
		      	vertex(
		      		this.children[i].junction.pos.x, 
		      		this.children[i].junction.pos.y);
		      	
		      	vertex(
		      	 this.junction.pos.x+pass/2, //bottom right hand corner of the triangle
		      	 height); 

		      	endShape(CLOSE);
				

			};

			
		};

		pop();
	};

	this.tree = function () {
		stroke(255, 50);
		strokeWeight(this.scale/20);




		for(var i = 0; i < this.children.length; i++){

			
			line(this.junction.pos.x, this.junction.pos.y, this.children[i].junction.pos.x, this.children[i].junction.pos.y); 
		}
		


		noStroke();

		//fill(255,50);
		//textSize(12);
		//text(this.scale, this.junction.pos.x, this.junction.pos.y);

		this.children.map( (c) => c.tree());


		//this.fireflies();

	}

	this.edgeCollide = function() {
		this.junction.edgeCollide();
		for(var i = 0; i<this.children.length; i++){
			this.children[i].junction.edgeCollide();
		};

	};

	this.angular = function(){
		if(this.recurse){
			this.junction.angular();

		};
		for(var i = 0; i < this.children.length; i++){
			this.children[i].angular();
		};
	};

	this.applyForce = function (f){
		applyForce(f, this.junction);
		this.children.map( (c) => c.applyForce(f));
	};

	this.applyWind = function(){
		this.junction.applyWind();
		for(var i = 0; i<this.children.length; i++){
			this.children[i].applyWind();
		};
	};

	this.gravity = function (){
		this.junction.gravity();
		this.children.map( 	(c) => c.gravity());
	};



};

function Tree (x, y, n, theta, w, sc) {
	var root = new Mover (x,y,0,0,w,sc);
	root.buildTree();

}