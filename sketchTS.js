/*
TO DO

[1.] Ensure Node constructor is in fact building multiple children
[2.] alter tetherUpdate2 so it exerts force on the tether (based on difference between velocity before and after conversion to angular velocity)
[2. a.] figure out what the deal is with the relative forces of oscillation and wind
[2. b.] run wind on a unversally accessible multiplier
3. Build tree display function
	 [a.] more realistic Node constructor
	 b. leaves (NOT YET)
4. Move functions outside mover/junction class? Have a class for Tree, Grass, and Mover? So Tree is just a stack of tethered movers?
5. Build grass display function
[6.] change gravity to be dependent on a Movers weight
7. Build bugs
8. AESTHETICALLY - translucent shapes on black background - esp flowers
**. For a perfect 'bouncing twig' convert the edge collide transfer so that it affects velocity NOT acceleration

*/



var wind;
var up = true;
var right = true;

var windStrength = 0.05; //change this to globally alter wind strength (imagine this is 'air density')
var gravStrength = 0.1; //multiplies the effect of gravity
var tension = 0.005; //change this to globally alter angular tension (i.e. tree branches 'swinging back')
var grassDensity = 1;
var treeLimit = 10;

var testTree;
//var gravity;




function setup() {
	smooth();


	createCanvas(1200, 600);
	background(0);

	wind = createVector (0,0);
	//gravity = createVector(0,1);

	bouncyBoy = new Mover(width/2,height/4,2,0,100, 40);
	bouncyBoy2 = 	new Mover(width/2,height/2,-2, 0, 10, 40);
	//bouncyBoy.tetherTo(bouncyBoy2); 

	testTree = new Mover(width/2, height,0,0,100,160);
	testTree.buildTree();

	testTree2 = new Tree(3*width/4, 130);

	
};


function draw () {
	background(0,20);
	blow();


	
	bouncyBoy2.update();
	bouncyBoy2.applyWind();
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

	//testTree.gravity();
	//testTree.angular();
	//testTree.applyWind();
	//testTree.updateTree();
	testTree.showTree();

	testTree2.show();



};

function mousePressed() {
		right = !right;
};

function keyPressed (){

	//heading += PI/60;
	//print("heading = " + heading);
	

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


function Tree(x,scale,theta){ //for root, use syntax "Tree([x position], [starting scale])"

	this.scale = scale;

	if(x instanceof Tree){
		this.tethered = true;
		this.parent = x;
		x.branches.push(this);
		this.origAngle = theta;
		this.angle = theta;
		this.pos = createVector(x.pos.x+sin(theta)*scale,x.pos.y+cos(theta)*scale);
	}else{
		this.pos = createVector(x, height);
		this.angle = -PI;
		this.parent = null;
		this.tethered = false;
	};

	this.rotVel = 0;
	this.rotAccel = 0;
	this.branches = new Array();
	
	//determine the number of branches	
	if(this.tethered && random(0,100)<83){
				print("ping");	
				this.maxChildren = 2;
			}else{
				this.maxChildren = 1;	
	};

	if(this.scale>treeLimit){ //if the scale is large enough, recurse!
			var newAng = 0;
				if(this.maxChildren == 1){
					newAng = this.angle+random(-PI/30, PI/30)+random(-PI/30, PI/30);
					var child = new Tree(this, this.scale*(random(0.6,0.85)), newAng);
				}else{
					newAng = this.angle-PI/8+random(-PI/15, PI/15)+random(-PI/15, PI/15);
					var child1 = new Tree(this, this.scale*(random(0.6,0.85)), newAng);
					newAng = this.angle+PI/8+random(-PI/15, PI/15)+random(-PI/15, PI/15);
					var child2 = new Tree(this, this.scale*(random(0.6,0.85)), newAng);
				};
	};

	this.show = function(){
		stroke(255, 50);
		strokeWeight(this.scale/20);

		for(var i = this.branches.length-1; i > -1; i--){
			line(this.pos.x, this.pos.y, this.branches[i].pos.x, this.branches[i].pos.y);
			//this.branches[i].show();
		};

		textSize(9);
		text((this.maxChildren), this.pos.x, this.pos.y);	
		noStroke();


		this.branches.map( (t) => t.show());

	};

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
			var transfer = createVector (this.vel.x*abs(cos(this.angle)), this.vel.y*abs(sin(this.angle)));
			//transfer.mult(this.weight);
			t.applyForce(transfer);
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
			pass.add(this.tether.vel);
			this.vel.set(pass);
			
		}else{
			this.vel.add(this.accel);
			this.accel.set(0,0);
			this.pos.add(this.vel);
		};
	};

	


	this.angular = function (){ //enacts angular tension on the mover (eg for tree branches)
		if(this.tethered){
			var tense = this.origAng-this.angle;
			this.rotAccel += tense*tension;

		};

		this.tethers.map( (c) => c.angular());

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
			var rotF = force.x*-sin(this.angle)+force.y*cos(this.angle);
			this.rotAccel += rotF/(this.weight*this.radius);
			var tetherF = createVector(force.x*(cos(this.angle)+1)/2, force.y*(1+sin(this.angle))/2);
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
			if(this.tethers.length>0){
				print("transfer x: " + this.vel.x*this.weight);
				var transfer = createVector(this.vel.x*this.weight,0);
				for (i = 0; i<this.tethers.length; i++){
					this.tethers[i].applyForce(transfer.mult(-1*abs(sin(this.tethers[i].angle))));
				};
			};
		};

		if ((this.pos.y<=0 && this.vel.y<0)||(this.pos.y>=height && this.vel.y>0)) {
			this.vel.y=this.vel.y*-1;
			if(this.tethers.length>0){
				print("transfer y: " + this.vel.y*this.weight);
				var transfer = createVector(0,this.vel.y*this.weight);
				for (i = 0; i<this.tethers.length; i++){
					this.tethers[i].applyForce(transfer.mult(-1*abs(cos(this.tethers[i].angle))));
				};
			};

		};
	};

	this.applyWind = function () {  //this is a globally available function to apply the wind speed to the mover in a more realistic way, as though it were air.
		var effectOfWind = p5.Vector.sub(wind,this.vel);
		effectOfWind.mult(windStrength);
		effectOfWind.mult(effectOfWind.mag());
		this.applyForce(effectOfWind);

		this.tethers.map( (c) => c.applyWind());
	};

	this.gravity = function () {
		gravity = createVector (0,gravStrength*this.weight);
		this.applyForce(gravity);

		this.tethers.map( (c) => c.gravity());
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
		if (this.scale > treeLimit){

			//establish number of children
			var maxChildren;

			if(this.tethered && random(0,100)<83){
				maxChildren = 2;
			}else{
				maxChildren = 1;	
			};

			//establish starting angle

			var ang;

			if(this.tethered){
				ang=this.angle-PI/2;
			}else{
				ang=PI;
			};

			//print("maxChildren " + maxChildren);
			//print("angle: " + degrees(ang));

			for(i=0; i<maxChildren; i++){
				
				if(maxChildren>1){
					var newAng = ang-PI/8+i*PI/4+random(-PI/15, PI/15)+random(-PI/15, PI/15);
				}else{
					var newAng = ang+random(-PI/30, PI/30)+random(-PI/30, PI/30);
				};

				var xCoOrd = this.pos.x + this.scale*-sin(newAng);
				var yCoOrd = this.pos.y + this.scale*cos(newAng);
				var child = new Mover(xCoOrd, yCoOrd, 0, 0, this.weight*0.9, this.scale*(random(0.6,0.85)), this); //by altering the last two numbers you can alter the shapes
				//print("Parent scale: " + this.scale + " and child scale: " + child.scale);
				//print(degrees(child.angle));
				//print(degrees(atan2(this.pos.y-child.pos.y, this.pos.x-child.pos.x)));
				
			};

			this.tethers.map( (c) => c.buildTree());


			

		}else{
			this.buildLeaves();
		};

		//print("tethers length: " + this.tethers.length);
	};

	this.updateTree = function (){

		if(this.tethered){
			this.update();
		};

		this.tethers.map(  (c) => c.updateTree()  );
	};

	this.showTree = function (){
		stroke(255, 50);
		strokeWeight(this.scale/20);

		for(var i = 0; i < this.tethers.length; i++){

			
			line(this.pos.x, this.pos.y, this.tethers[i].pos.x, this.tethers[i].pos.y); 
		};


		//textSize(9);	
		//text(this.tethers.length, this.pos.x, this.pos.y);
		
		noStroke();
		
		//fill(255,50);
		//textSize(12);
		//text(this.scale, this.junction.pos.x, this.junction.pos.y);

		this.tethers.map( (t) => t.showTree());
	};

	//------------LEAVES----------------

	this.buildLeaves = function(){
		for(i=0; i<5; i++){
			var leafAng = this.angle-3*PI/4+PI*i/8+random(-PI/15, PI/15)+random(-PI/15, PI/15);
			var xCoOrd = this.pos.x + this.scale*-sin(leafAng);
			var yCoOrd = this.pos.y + this.scale*cos(leafAng);
			var leaf = new Mover(xCoOrd, yCoOrd, 0, 0, this.weight/2, this.scale/2, this);
		}
	};
};