/*
TO DO

[1.] Ensure Node constructor is in fact building multiple children
[2.] alter tetherUpdate2 so it exerts force on the tether (based on difference between velocity before and after conversion to angular velocity)
3. Build tree display function
4. Build grass display function
4. a. change gravity to be dependent on a Movers weight
5. Build bugs
6. AESTHETICALLY - translucent shapes on black background - esp flowers
7. Put off 'bouncing twig' physics - it's not necessary for this build

*/



var wind;
var up = true;
var right = true;

var angle;

var testFireflies;
var testTree;
var gravity;


function setup() {

	createCanvas(600, 600);
	background(0);

	wind = createVector (0,0);
	gravity = createVector(0,1);


	testFireflies = new Node(width/2, 3*height/4, 3, 2, PI, 10, 50);
	testTree = new Node(width/4, height, 3, 3, PI, 20, 40);

	testGrass = new Node (3*width/4, height, 1, 2, PI, 3, 100);
	
};


function draw () {
	background(0,20);
	
	testFireflies.update();
	testFireflies.applyWind();
	//testFireflies.junction.applyForce(wind);
	testFireflies.junction.edgeUpdate();
	testFireflies.junction.control();
	testFireflies.fireflies();
	

	testTree.update();
	testTree.applyWind();
	testTree.applyForce(gravity);
	testTree.angular();
	testTree.fireflies();

	testGrass.update();
	testGrass.applyWind();
	testGrass.angular();
	testGrass.grass();

	blow();
	print(right);



};

function mousePressed() {
		right = !right;
	};

function blow(){
	if(right){
		if (wind.x > .3){
				up = false;
			}else if(wind.x<0){
				up = true;
			}


		if(up){
			wind.x+= 0.003;
		}else{
			wind.x -= 0.003;	
		};


	}else{


		if (wind.x < -.3){
				up = false;
			}else if(wind.x > 0){
				up = true;
			}


		if(up){
			wind.x -= 0.003;			
		}else{
			wind.x += 0.003;
		}
	}

	//print(wind.x);
};



//physics object class
function Mover (x, y, vx, vy, w, sc) {
	this.pos = createVector(x, y); 
	this.vel = createVector (vx, vy);
	this.accel = createVector (0,0);  
	this.weight = w;
	this.scale = sc;
	this.tethered = false;
	this.tether;
	this.radius;
	this.angle;
	this.origAng;

	//------TETHERING FUNCTIONS-----------

	this.tetherUpdate2 = function(){
		//first, standard physics update
		this.vel.add(this.accel);
		this.accel.set(0,0);
		//then convert everything to angular velocity
		var angVel = (this.vel.x*-sin(this.angle)+this.vel.y*cos(this.angle))/this.radius;
		this.angle += angVel;
		
		//the x component of the velocity should be multiplied by -sin(angle) but I DON'T KNOW WHY YET
		//store (negative) old position in pass to calculate momentum
		var pass =  createVector(-this.pos.x, -this.pos.y);
		
		this.pos.set(this.tether.pos.x+cos(this.angle)*this.radius, this.tether.pos.y+sin(this.angle)*this.radius);

		//change pass to an expression of current momentum by adding current position

		pass.add(this.pos);

		var swing = p5.Vector.sub(this.vel,pass); //swing expresses the difference between tethered velocity, and velocity if the Mover were untethered
		//swing.mult(this.weight);
		this.tether.applyForce(swing);

		//last, update the velocity to reflect the direction you're actually going
		this.vel.set(pass);
	};

	this.tetherTo = function(t) { //this function tethers an untethered mover to a new tether 
		if(this.tethered == false){
			this.tether = t;
			this.radius = this.pos.dist(t.pos);
			this.origAng = atan2(this.pos.y-t.pos.y, this.pos.x-t.pos.x);
			this.angle = atan2(this.pos.y-t.pos.y, this.pos.x-t.pos.x);
		};
	};

	this.untether = function(){}; //WIP

	this.angular = function (){ //enacts angular tension on the mover (eg for tree branches)
		var toward = createVector(this.tether.pos.x+cos(this.origAng)*this.radius, this.tether.pos.y+sin(this.origAng)*this.radius);
		var f = p5.Vector.sub(toward, this.pos);
		
		//draws a line to the point towards which this function is returning the mover 

		/*stroke(255,225,50);
		line(this.pos.x, this.pos.y, toward.x, toward.y);
		noStroke(); 
		*/
		
		f.mult(f.mag());
		f.div(this.radius);
		this.applyForce(f);
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
		var f = p5.Vector.div(force,this.weight);
		this.accel.add(f);
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

	this.update = function () {  //manages acceleration, speed, position for untethered objects
		this.vel.add(this.accel);
		this.accel.set(0,0);
		this.pos.add(this.vel);
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
		this.applyForce(effectOfWind);
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
};

function Node (x, y, n, n2, theta, w, sc) {
	/*
	x = starting x coordinate
	y = starting y coordinate
	n = maximum number of times the tree of objects will 'extend' before terminating the recursion
	n2 = maximum numnber of children in each branch
	theta = current angle
	w = current weight
	sc = current scale
	*/

	this.junction = new Mover(x, y, 0, 0, w, sc);
	this.children = new Array();
	this.recurse = false;
	this.physical = new Mover(x, y, 0, 0, w, sc);
	this.scale = sc;
	this.lat = x;
	this.long = y;
	this.weight = w;
	this.maxN = n;
	this.angle = theta;

	if(this.maxN>0){				
		for(var i = 0; i < n2; i++){
			newAng = this.angle+random(-PI/4, PI/4);
			xCoOrd = this.lat + this.scale*sin(newAng);
			yCoOrd = this.long + this.scale*cos(newAng);
			this.children[i] = new Node(xCoOrd, yCoOrd, this.maxN-1, n2, newAng, this.weight-1, this.scale-1);
			this.children[i].recurse = true;
			this.children[i].junction.tetherTo(this.junction);					
		};
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
		for(var i = 0; i < this.children.length; i++){
			this.children[i].edgeUpdate();	
		} ;
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
		fill(150, 240, 210, 100);//
		var pass = this.scale/3;
		for (var i = 0; i < this.children.length; i++){
			
	      	
	      	beginShape();
	      	
	      	vertex(this.junction.pos.x-pass, height);//bottom left hand corner of the triangle
	      	
	      	bezierVertex(
	      		this.junction.pos.x-pass/2, //first story 
	      		height-pass, 
	      		this.children[i].junction.pos.x, //second story
	      		height-2*pass, 
	      		this.children[i].junction.pos.x, 
	      		this.children[i].junction.pos.y);
	      	
	      	bezierVertex(this.children[i].junction.pos.x, //second story
	      	 height-2*pass,
	      	 this.junction.pos.x+pass/2, //first story
	      	 height-pass,
	      	 this.junction.pos.x+pass, //bottom right hand corner of the triangle
	      	 height); 

	      	endShape(CLOSE);			
		};
	};

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
		this.junction.applyForce(f);
		for(var i = 0; i < this.children.length; i++){
			this.children[i].junction.applyForce(f);	
		}; 
	};

	this.applyWind = function(){
		this.junction.applyWind();
		for(var i = 0; i<this.children.length; i++){
			this.children[i].junction.applyWind();
		};
	};



};