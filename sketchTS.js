/*
TO DO

[1.] Leaf display section
[2.] FUNCTION FOR MEASURING ANGLE BETWEEN ANGLES
[3.] leaves!! Done
4. Grass
5. Wind gusts
6. get rid of 180/0 degree leaves
7. make it so that leaf display is organised by stroke, save processor


*/



var wind;
var up = true;
var right = true;

var windStrength = 4.5; //change this to globally alter wind strength (imagine this is 'air density')
var gravStrength = 1; //multiplies the effect of gravity
var tension = 0.001; //change this to globally alter angular tension (i.e. tree branches 'swinging back')
var grassDensity = 1;
var treeLimit = 10;
var windLimit = 2;
var variab = 0;

var testTree;
//var gravity;

leaves = new Array();
var leavesLim = 12;
var leafTolerance = 45;

function setup() {
	smooth();

	leafTolerance = radians(leafTolerance);

	createCanvas(1200, 600);
	background(0);

	wind = createVector (0,0);
	//gravity = createVector(0,1);

	

	testGrass = new Grass(width/2, 5, -PI/2);


	for(i=0; i<leavesLim; i++){
		leafy = new Leaf (width/2, height/2, 12, i*(2*PI/leavesLim));
		leaves.push(leafy);
	};

	testTree = new Tree (width/4, random(60,150));
	testTree2 = new Tree(3*width/4, 130);

	print("leaves length " + leaves.length);

};


function draw () {
	background(0,20);
	blow();


	testTree.wind();
	testTree.angular();
	testTree.update();
	testTree.show();

	testTree2.wind();
	testTree2.angular();
	testTree2.update();
	testTree2.show();

	//leaves.map( (l) => l.show());
	leaves.map( (l) => l.update());

	testGrass.showCentre();
	testGrass.angle += .1;

	textSize(20);
	if(variab == 0){
		fill(250,0,0);
	}else{
		fill(255,255,255);
	};
	text("wind strength: " + windStrength, 0, 25);
	if(variab == 1){
		fill(250,0,0);
	}else{
		fill(255,255,255);
	}
	text("tension: " + tension, 0, 50);
	if(variab == 2){
		fill(250,0,0);
	}else{
		fill(255,255,255);
	}
	text("wind limit: " + windLimit, 0, 75);


	if(keyIsDown(DOWN_ARROW)){	
		if(variab ==0){
			windStrength -= 0.01;
		} else if(variab == 1){
			tension -= 0.0001;
		} else if(variab == 2){
			windLimit -= 0.1;
		};
	}else if(keyIsDown(UP_ARROW)){
		if(variab ==0){
			windStrength += 0.01;
		} else if(variab == 1){
			tension += 0.0001;
		} else if(variab == 2){
			windLimit += 0.1;
		};
	};

};

function mousePressed() {
	if(variab < 2){
		variab += 1;
	}else{
		variab = 0;
	};

};

function keyPressed (){


};

function blow(){
	if(right){
		if (wind.x > windLimit){
				up = false;
			}else if(wind.x<0){
				up = true;
			}


		if(up){
			wind.x += 0.01*windStrength;
		}else{
			wind.x -= 0.01*windStrength;	
		};


	}else{


		if (wind.x < -windLimit){
				up = false;
			}else if(wind.x > 0){
				up = true;
			}


		if(up){
			wind.x -= 0.01*windStrength;			
		}else{
			wind.x += 0.01*windStrength;
		}
	}

	//print(wind.x); //manages the wind
};

function angleBetween(a1, a2){
	var out = abs(a1-a2)

	if(out > 2*PI){
		out -= 2*PI;
	};

	if (out > PI){
		out = (2*PI)-out;
	};

	print("a1 " + degrees(a1) + " and branch angle " + degrees(a2) + " and out is " + degrees(out));

	return out;

};

function Tree(x,scale,theta){ //for root, use syntax "Tree([x position], [starting scale])"

	this.scale = scale;
	this.vel = createVector(0,0);

	if(x instanceof Tree){
		this.tethered = true;
		this.parent = x;
		x.branches.push(this);
		this.origAngle = theta;
		this.origAng = theta-x.angle;
		this.ang = theta-x.angle;
		this.angle = theta;
		this.pos = createVector(x.pos.x+cos(theta)*scale,x.pos.y+sin(theta)*scale);
	}else{
		this.pos = createVector(x, height);
		this.angle = -PI/2;
		this.parent = null;
		this.tethered = false;
	};

	this.rotAccel = 0;
	this.rotVel = 0;
	this.branches = new Array ();
	this.l = new Array ();
	
	//determine the number of branches	
	if(this.tethered && random(0,100)<83){	
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
	}else{
		//print("below scale");
		//print(leaves.length);
		leaves.map(  (l) => l.attachLeaves(this));
		
	};


	//---------------FUNCTIONS-------------------------

	this.show = function(){
		stroke(255, 50);
		strokeWeight(this.scale/20);

		for(var i = this.branches.length-1; i > -1; i--){
			line(this.pos.x, this.pos.y, this.branches[i].pos.x, this.branches[i].pos.y);
		};

		textSize(9);
		//text((this.maxChildren), this.pos.x, this.pos.y);	
		noStroke();


		this.branches.map( (t) => t.show());

		if(this.scale<treeLimit){
			print(this.l.length);

			for (var i = this.l.length - 1; i >= 0; i--) {
				this.l[i].showAt(this.pos.x, this.pos.y);
			};	
		};
	};



	//redundant - this function drew the tree using relative angles to try and relieve processor load
	this.popShow = function(){
		push();
		if(!this.tethered){
			translate(this.pos.x, this.pos.y);
			rotate(PI);
		};
		
		stroke(255, 50);
		strokeWeight(this.scale/20);

		for(var i = this.branches.length-1; i > -1; i--){
			push();
			rotate(this.branches[i].ang);
			line(0,0,0, this.branches[i].scale);
			translate(0,this.branches[i].scale);
			this.branches[i].popShow();
			pop();
		};

		noStroke();

		pop();
	};

	this.applyForce = function (force){
		if(force instanceof p5.Vector){
			 if(this.tethered){
				var rotF = force.x*-sin(this.angle)+force.y*cos(this.angle);
				this.rotAccel += rotF/(this.scale*this.scale*this.scale);
				var tetherF = createVector(force.x*abs(cos(this.angle)), force.y*abs(sin(this.angle)));
				this.parent.applyForce(tetherF);
			};
		};
	};

	this.wind = function(){
		var effectOfWind = p5.Vector.sub(wind,this.vel);
		//effectOfWind.mult(windStrength);
		//effectOfWind.mult(effectOfWind.mag());
		this.applyForce(effectOfWind);
		this.branches.map( (b) => b.wind());
	};

	this.angular = function (){
		if(this.tethered){
			var mag = this.origAng - this.ang;
			//print(mag);
			var proportion = abs(4*mag/PI);
			this.rotVel += mag*tension*this.scale;//*proportion
		};

		this.branches.map( (b) => b.angular());

	};

	//redundant
	this.popUpdate = function() {
		if(this.tethered){
			var windEffect = ((wind.x/*-this.vel.x*/)*-sin(this.angle)+(wind.y/*-this.vel.y*/)*cos(this.angle))/this.scale/this.scale;
			var mag = (this.origAng-this.ang);
			var prop = abs(4*mag/PI);
			var tenseEffect = mag*tension*prop;
			this.parent.ang += 0;//windEffect*tension*prop/this.parent.scale;??
			print(degrees(windEffect+tenseEffect));
			this.ang += windEffect+tenseEffect;

			//this.angle = this.parent.angle + this.ang;
			//this.pos.set(this.parent.pos.x+cos(this.angle)*this.scale,this.parent.pos.y+sin(this.angle)*scale);
			//this.vel.set(this.rotVel*this.scale*-sin(this.angle), this.rotVel*this.scale*cos(this.angle));
			//this.vel.add(this.parent.vel);
		};

		this.branches.map( (b) => b.popUpdate());

		
	};


	this.update = function (){
		//tetherupdate
		if(this.tethered){
			this.rotVel *= 0.9; //this damper stops the tree tearing itself apart - if there's no 'friction' in the rotational momentum of the branch, forces multiply catastrophically.
			this.rotVel += this.rotAccel;
			this.rotAccel =0;
			this.angle += this.rotVel;
			this.ang = this.angle-this.parent.angle;
			this.pos.set(this.parent.pos.x+cos(this.angle)*this.scale,this.parent.pos.y+sin(this.angle)*scale);
			this.vel.set(this.rotVel*this.scale*-sin(this.angle), this.rotVel*this.scale*cos(this.angle));
			this.vel.add(this.parent.vel);
		};

		this.branches.map( (b) => b.update());
	};

	this.control = function (){
		if(keyIsDown(LEFT_ARROW)){
			this.angle -= 10/this.scale;
		};
		if(keyIsDown(RIGHT_ARROW)){
			this.angle += 10/this.scale;
		};

		this.branches.map(  (b) => b.control());

	};
};

function Leaf (x,y,scale,theta) {

	this.scale = scale;
	this.origAngle = theta;
	this.angle = theta;
	this.rotAccel = 0;
	this.rotVel = 0;
	this.pos = createVector(x,y);
	this.fill1 = random(200,255);
	this.fill2 = random(150,255);
	this.fill3 = random(0,150);
	//print(this.fill1 + ", " + this.fill2 + ", " + this.fill3);

	this.show = function () {
		push();
		stroke(255, 50);
		strokeWeight(this.scale/20);
		translate(this.pos.x, this.pos.y);
		rotate(this.angle);
		line(0,0,0, this.scale/2);
		translate(0,this.scale/2);
		noStroke();
		//stroke(120,120,0,50);
		//strokeJoin(ROUND);
		//strokeWeight(this.scale/4);
		fill(this.fill1,this.fill2,this.fill3,80);
		this.leafShape(this.scale);
		//rotate(PI/4);
		//this.leafShape(.75*this.scale);
		//rotate(-PI/2);
		//this.leafShape(.75*this.scale);
		pop();
	};

	this.showAt = function(xCoord, yCoord){
		push();
		stroke(255, 50);
		strokeWeight(this.scale/20);
		translate(xCoord, yCoord);
		rotate(this.angle);
		line(0,0,0, this.scale/2);
		translate(0,this.scale/2);
		noStroke();
		//stroke(120,120,0,50);
		//strokeJoin(ROUND);
		//strokeWeight(this.scale/4);
		fill(this.fill1,this.fill2,this.fill3,100);
		this.leafShape(this.scale);
		//rotate(PI/4);
		//this.leafShape(.75*this.scale);
		//rotate(-PI/2);
		//this.leafShape(.75*this.scale);
		pop();

	}

	this.leafShape = function (scale) {
		beginShape();
		vertex(0,0);
		quadraticVertex(scale, scale/3, 0, scale*3/2);
		quadraticVertex(-scale, scale/3, 0, 0);
		endShape(CLOSE);
	};

	this.update = function () {
		this.rotVel *= 0.9;
		var effectOfWind = wind.x*-cos(this.angle);// + wind.y*-sin(this.angle);
		this.rotVel += effectOfWind/this.scale/this.scale;
		this.angle += this.rotVel;
		var mag = this.origAngle - this.angle;
		var proportion = abs(4*mag/PI);
		this.rotVel += mag*tension*this.scale;
		//print("angle: " + this.angle);
	};

	this.attachLeaves = function(t){
		if(angleBetween(this.origAngle+(PI/2),t.origAngle)<leafTolerance){
			t.l.push(this);
			print("success");
		};

		
		
	};
};

function Grass (x, s, theta){
	this.lat = x;
	this.scale = s;
	this.origAngle = theta;
	this.angle = theta;
	this.rotAccel = 0;
	this.rotVel = 0;

	this.grassShape = function (s) {
		fill(180,250,180,150);
		beginShape();
		vertex(s,0);
		quadraticVertex(s, -4*s, 14*s*cos(this.angle), 14*s*sin(this.angle));
		quadraticVertex(-s, -4*s, -s, 0);
		endShape(CLOSE);

	};

	this.showCentre = function () {
		push();
		translate(width/2, height/2);
		//rotate(PI);
		this.grassShape(this.scale);
		pop();
	};

	this.show = function(){

	};

};