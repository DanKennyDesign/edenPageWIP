/*
TO DO

1. Ensure Node constructor is in fact building multiple children
2. alter tetherUpdate2 so it exerts force on the tether (based on difference between velocity before and after conversion to angular velocity)
3. Build tree display function
4. Build grass display function
5. Build bugs
6. AESTHETICALLY - translucent shapes on black background - esp flowers
7. Put off 'bouncing twig' physics - it's not necessary for this build

*/



var wind;
var up = true;
var right = true;
//var centre;
//var oscillator;
var angle;

//var balls = [];
//var testNode;
var testFireflies;
var testTree;


function setup() {

	createCanvas(600, 600);
	background(0);
	
	//making the oscillator to swing from the centre...

	wind = createVector (0,0);

	/*
	var howManyBalls = int(random(10));
	for(var i = 0; i < howManyBalls; i++){
		balls[i] = new Mover (width/2, random(height), random(-5,5), random(-5,5), 200, 4); 
	};
	
	centre = new Mover (300, 300, 0, 0, 20, 4);
	oscillator = new Mover(300, 450, 0, 0, 5, 4);
	oscillator.tetherTo(centre);
	
	*/

	//testNode = new Node(3*width/4, 3*height/4, 2, 2, 0, 20, 60);
	testFireflies = new Node(width/2, 3*height/4, 3, 2, PI, 25, 50);
	testTree = new Node(width/4, height, 3, 3, PI, 200, 40);
	
};


function draw () {
	background(0,20);
	/*
	for(var i = 0; i < balls.length; i++){ //bouncy balls!
		balls[i].update ();
		balls[i].edgeCollide();
		balls[i].show();
		balls[i].applyForce(wind);
	};
	*/

	/*

	centre.edgeCollide();
	centre.update();
	centre.show();
	centre.applyForce(wind);

	oscillator.tetherUpdate2();
	oscillator.applyForce(wind);
	oscillator.show();
	*/

	
	testFireflies.update();
	testFireflies.applyWind();
	//testFireflies.junction.applyForce(wind);
	testFireflies.junction.edgeUpdate();
	testFireflies.junction.control();
	testFireflies.fireflies();
	

	testTree.update();
	testTree.applyWind();
	testTree.angular();
	testTree.fireflies();



	//testNode.update();
	//testNode.applyWind();
	//testNode.applyForce(wind);
	//testNode.nodeShow();
	//print(wind.x);

	blow();
	print(right);



};

function mousePressed() {
		if (right){
			right = false;
		}else{
			right = true;
		}
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
	this.origAng;

	//------TETHERING FUNCTIONS-----------

	this.tetherUpdate2 = function(){
		//first, standard physics update
		this.vel.add(this.accel);
		this.accel.set(0,0);
		//then convert everything to angular velocity
		var angVel;
		var angle = atan2(this.pos.y-this.tether.pos.y, this.pos.x-this.tether.pos.x);
		angVel = (this.vel.x*-sin(angle)+this.vel.y*cos(angle))/this.radius;
		angle += angVel;
		
		//the x component of the velocity should be multiplied by -sin(angle) but I DON'T KNOW WHY YET
		//store (negative) old position in pass to calculate momentum
		var pass =  createVector(-this.pos.x, -this.pos.y);
		
		this.pos.set(this.tether.pos.x+cos(angle)*this.radius, this.tether.pos.y+sin(angle)*this.radius);

		//change pass to an expression of current momentum by adding current position

		pass.add(this.pos);

		var swing = p5.Vector.sub(this.vel,pass); //swing expresses the difference between tethered velocity, and velocity if the Mover were untethered
		//swing.mult(this.weight);
		this.tether.applyForce(swing);

		//last, update the velocity to reflect the direction you're actually going
		this.vel.set(pass);
	};

	this.edgeTetherUpdate = function () { //WIP: meant to simultaneously tether update and edgecollide to avoid 'sticking'
		//first, standard physics update
		this.vel.add(this.accel);
		this.accel.set(0,0);
		//then convert everything to angular velocity
		var angVel;
		var angle = atan2(this.pos.y-this.tether.pos.y, this.pos.x-this.tether.pos.x);
		angVel = (this.vel.x*-sin(angle)+this.vel.y*cos(angle))/this.radius;

		/*
		if ((this.pos.x<=0 && this.vel.x<0)||(this.pos.x>=width && this.vel.x>0)) {
			angVel=angVel-1;
		};

		if ((this.pos.y<=0 && this.vel.y<0)||(this.pos.y>=height && this.vel.y>0)) {
			angVel=angVel*-1;

		};
		*/
		angle += angVel;
		
		//the x component of the velocity should be multiplied by -sin(angle) but I DON'T KNOW WHY YET
		//store (negative) old position in pass to calculate momentum
		var pass =  createVector(-this.pos.x, -this.pos.y);
		
		this.pos.set(this.tether.pos.x+cos(angle)*this.radius, this.tether.pos.y+sin(angle)*this.radius);

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
		};
	};

	this.untether = function(){}; //WIP

	this.angular = function (){ //enacts angular tension on the mover (eg for tree branches)
		var toward = createVector(this.tether.pos.x+cos(this.origAng)*this.radius, this.tether.pos.y+sin(this.origAng)*this.radius);
		var f = p5.Vector.sub(toward, this.pos);
		
		stroke(255,225,50);
		line(this.pos.x, this.pos.y, toward.x, toward.y);
		noStroke(); 
		
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
		this.children.map(  function(c) {c.update();}  );

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
/*
			class Node {
  Node [] children;
  Node parent;
  Mover junction;
  int sc;
  int track;
  boolean recurse;
  boolean dad;
  float ang;
  PVector orig; //relative to parent
  float d; //from parent

  Node (int startScale, int stopScale, float startX, float startY, float angle, float dense) {
    sc = startScale;
    ang = angle;
    junction = new Mover(startX, startY, 0, 0, int(startScale*dense));
    track = int(2.7-noise(startX, startY));
    //    println(noise(startX, startY));

    if (startScale>stopScale) {
      recurse = true;
      children = new Node [track];

      if (track == 2) {
        int kidScale = int(random(2, sc-2));
        float dist = kidScale*4;
        float kidAng = ang+PI/4*(0.3-(pow(noise(400*startX*startY), (startScale-kidScale))));//angle-PI/3+(2*PI/3*((i+1.0)/(track+1)))+(PI/3)*(0.5-noise(startX*startY));
        float additive = dist*(0.5-noise(startX*startY)); //for a 'kick' that doesn't change angle
        float passX = (dist*cos(kidAng))+sin(kidAng)*additive;
        float passY = (dist*sin(kidAng))+cos(kidAng)*additive;
        children[1] = new Node(kidScale, stopScale, startX+passX, startY+passY, kidAng, dense);
        children[1].parent = this;
        children[1].dad = true;
        children[1].orig = new PVector(children[1].junction.pos.x-startX, children[1].junction.pos.y-startY);
        //println(children[1].junction.pos.x-startX-children[1].orig.x);
        children[1].d = dist;
        sc -= int(kidScale/2);
      }

      int kidScale = sc-3;
      if (kidScale<1) {
        kidScale = 1;
      }
      float dist = sc*3;
      float kidAng = ang+(startScale-kidScale)*PI/30*(0.3-noise(startX*startY));//angle-PI/3+(2*PI/3*((i+1.0)/(track+1)))+(PI/3)*(0.5-noise(startX*startY));
      float additive = 0;//2*dist*(0.5-noise(startX*startY)); //for a 'kick' that doesn't change angle
      float passX = (dist*cos(kidAng))+sin(kidAng)*additive;
      float passY = (dist*sin(kidAng))+cos(kidAng)*additive;
      children[0] = new Node(kidScale, stopScale, startX+passX, startY+passY, kidAng, dense);
      children[0].parent = this;
      children[0].dad = true;
      children[0].orig = new PVector(children[0].junction.pos.x-startX, children[0].junction.pos.y-startY);
      //println(children[0].junction.pos.x-startX-children[0].orig.x);
      children[0].d = dist;
      sc = startScale;
    }
  }


  Node find() {
    Node givinItBack;
    int decide = int(random(0, children.length-1));
    if (children[decide].recurse) {
      givinItBack = children[decide].find();
    } else {
      givinItBack = children[decide];
    }
    return givinItBack;
  }

  void treeShow() {
    if (sc>0) {
      fill(color(255, 150));
      pushMatrix();
      translate(junction.pos.x, junction.pos.y);
      scale(0.02);
      if (recurse) {

        for (int i = 0; i<children.length; i++) {
          pushMatrix();
          scale(children[i].sc);
          rotate(PI/2+junction.heading(children[i].junction.pos));
          leaf();
          stroke(color(255, 150));
          strokeWeight(15+300/sc);
          line(0, 0, 0, -150);
          noStroke();
          popMatrix();
        }
      } else {
        //      fill(color(255, 0, 0));
        pushMatrix();
        scale(sc*2);
        rotate(PI/2+ang);
        greens.display();
        leaf();
        popMatrix();
        //      fill(color(255, 150));
      }

      if (sc<10) {
        pushMatrix();
        scale(sc);
        rotate(PI/2+ang);
        greens.display();
        popMatrix();
      }

      if (dad) {
        pushMatrix();
        scale(sc);
        rotate(PI/2+junction.heading(parent.junction.pos));
        leaf();
        popMatrix();
      } else {
        pushMatrix();
        scale(50);
        ellipse(0, 0, sc, sc);
        popMatrix();
      }
      popMatrix();

      if (recurse) {
        for (int i = 0; i<children.length; i++) {
          children[i].treeShow();
        }
      }
    }
  }

  void sway() {
    if (dad) {
      //      stroke(0, 0, 255);
      //      strokeWeight(3);
      //      line(junction.pos.x, junction.pos.y, parent.junction.pos.x+orig.x, parent.junction.pos.y+orig.y);
      //      point(parent.junction.pos.x+orig.x, parent.junction.pos.y+orig.y);
      //      noStroke();
    }
    if (dad) {
      PVector pass = new PVector(wind.x-junction.vel.x, 0);
      junction.applyForce(pass);
      junction.applyForce(junction.tension(parent.junction.pos.x+orig.x, parent.junction.pos.y+orig.y, 2*d, sc));
      junction.tension(parent.junction.pos.x+orig.x, parent.junction.pos.y+orig.y, 2*d, sc);
      //      parent.junction.applyForce(junction.tension(parent.junction.pos.x+orig.x, parent.junction.pos.y+orig.y, 2*d, sc));
      junction.tetherUpdate(parent.junction, d);
    } 
    if (recurse) {
      for (int i = 0; i<children.length; i++) {
        children[i].sway();
      }
    }
  }

  void firefly(int weigh) {
    //println("my scale is " + sc);
    junction.weight = weigh;
    junction.vel.x = 2;
    junction.vel.y = random(-2, 2);
    if (recurse) {
      for (int i = 0; i<children.length; i++) {
        children[i].firefly(weigh);
      }
    }
  }

  void fireFlyRun() {
    if (sc>0) {
      fill(color(255, 255, 0));
      junction.edgeCollide();
      if (dad) {
        junction.tetherUpdate(parent.junction, 20);
      } else {
        junction.update();
        if (junction.vel.mag()<1) {
          junction.vel.x += random(-2, 2);
          junction.vel.y += random(-2, 2);
        }
      }
      junction.show();
      if (recurse) {
        for (int i = 0; i<children.length; i++) {
          children[i].fireFlyRun();
        }
      }
      fill(color(0, 255, 0));
    }
  }


  void grassShow () {
    fill(150, 240, 210, 170);
    //      ellipse(junction.pos.x, junction.pos.y, sc, sc);
    if (dad) {
      fill(150, 240, 210, 170);//
      beginShape();
      vertex(parent.junction.pos.x-sc/3, height);//bottom left hand corner of the triangle
      bezierVertex(parent.junction.pos.x-(sc/3)+orig.x/3, height-d/3, junction.pos.x, height-2*d/3, junction.pos.x, junction.pos.y);
      bezierVertex(junction.pos.x, height-2*d/3, parent.junction.pos.x+(sc/3)+orig.x/3, height-d/3, parent.junction.pos.x+(sc/3), height);//bottom right hand corner of the triangle
      endShape(CLOSE);
    }
    if (recurse) {
      for (int i = 0; i<children.length; i++) {
        children[i].grassShow();
      }
    }
  }
}

*/
