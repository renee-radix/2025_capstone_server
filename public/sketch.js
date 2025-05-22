let img;

let maxXChange = 100; //this number can be ramped up and down to make more or less glitching
let maxYChange = 5;
let hFactor = 20;
let inverted = false;
let glitching = false;

let streakNum = 14;




function preload() {
	img = loadImage("retro_future_image.jpg");
}


function setup() {
	createCanvas(windowWidth, windowHeight);
	background(255);
 	img.resize(width,height);
	img.filter(POSTERIZE, 5);
	image(img, -maxXChange, -maxYChange);
}

function draw() {
  if (glitching == true){
    for (let i = 0; i < streakNum; i++) { //dist(pmouseX, pmouseY, mouseX, mouseY) * 0.04; i++) {
      drawStreak()
    }
	}
  if (glitching == false){
    background(img);
	let rand = random(100);
	if(rand < 10){
	drawStreak();
	}
  }
}

function drawStreak() {
	let y = floor(random(height));
	let h = floor(random(hFactor, hFactor + 10)); 
	let xChange = floor(random(-maxXChange, maxXChange));
	let yChange = floor(xChange * (maxYChange / maxXChange) * random());

	if (random() < .01 && maxXChange != 0) filter(POSTERIZE, floor(random(2, 6)));
	
	
	
	image(img, xChange, -maxYChange + y + yChange, img.width, h, 0, y, img.width, h);
	//copy(img, 0, y, img.width, h, xChange - maxXChange, -maxYChange + y + yChange, img.width, h);
}

function keyPressed() {
	if (keyCode == UP_ARROW){
		maxXChange = maxXChange + 10;
	}
	if (keyCode == DOWN_ARROW){
		maxXChange = maxXChange - 10;
	}
	if (keyCode == LEFT_ARROW && hFactor > 5){
		hFactor = hFactor - 5;
	}
	if (keyCode == RIGHT_ARROW){
		hFactor = hFactor + 5;
	}
	if (key == 'h'){
		streakNum--;
	}
	if (key == 'l'){
		streakNum++;
	}
}
function mouseClicked() {
  glitching = !glitching;
}

// is there a way I can make this have MIDI functionality? I'm struggling a little bit figuring out how given that it's all on the web
// but idk if I can do the picture subset thing that's happening in this sketch

// Visual masking? some kind of clear overlay video?