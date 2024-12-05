// make a fish object
const fish = {
  x: 100, // start x
  y: 100, // start y
  width: 64, // Width of the fish element
  height: 64, // Height of the fish element
  speed: 5, // speed can be realy fast 4 fun
  angle: Math.random() * Math.PI * 2, // random initial swim angle
  direction: 1, // 1 for right, -1 for left
};

// get DOM element for fish
const startFish = document.getElementById('startFish');

// Define the aquarium boundaries
const aquarium = document.getElementById('imgDiv');
const aquariumWidth = aquarium.offsetWidth;
const aquariumHeight = aquarium.offsetHeight;

// Determine initial direction based on the angle
fish.direction = Math.cos(fish.angle) >= 0 ? -1 : 1;
reflectFish(); // Ensure the fish starts facing the correct direction

// updates the fish position and angle
function updateFish() {
  // move the fish
  fish.x += fish.speed * Math.cos(fish.angle);
  fish.y += fish.speed * Math.sin(fish.angle);

  // Keep the fish within the aquarium boundaries
  if (fish.x < 0 || fish.x > aquariumWidth - fish.width) {
    fish.angle = Math.PI - fish.angle; // reverse horizontal direction
    fish.direction *= -1;
    reflectFish(); // flip the gif to swim the other way
  }
  if (fish.y < 0 || fish.y > aquariumHeight - fish.height) {
    fish.angle = -fish.angle; // reverse vertical direction
  }

  // apply the updated position to the DOM element
  startFish.style.left = `${fish.x}px`;
  startFish.style.top = `${fish.y}px`;
}

// function to reflect the fish
function reflectFish() {
  if (fish.direction === 1) {
    // right
    startFish.style.transform = 'scaleX(1)';
  } else {
    // left
    startFish.style.transform = 'scaleX(-1)';
  }
}

// initialize and animate the fish
function animateFish() {
  updateFish();
  requestAnimationFrame(animateFish);
}

// set the initial position of the fish
startFish.style.position = 'absolute';
startFish.style.left = `${fish.x}px`;
startFish.style.top = `${fish.y}px`;
startFish.style.transition = 'transform 0.3s';

// start the animation
animateFish();