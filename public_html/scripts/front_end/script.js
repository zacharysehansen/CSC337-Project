// make a fish object
const fish = {
  x: 100, // start x
  y: 100, // start y
  width: 64, // Width of the fish element
  height: 64, // Height of the fish element
  speed: 2, // speed can be realy fast 4 fun
  angle: Math.random() * Math.PI * 2, // random initial swim angle
};

// get DOM element for fish
const startFish = document.getElementById('startFish');

// Define the aquarium boundaries
const aquarium = document.getElementById('imgDiv');
const aquariumWidth = aquarium.offsetWidth;
const aquariumHeight = aquarium.offsetHeight;

// updates the fish position and angle
function updateFish() {
  // move the fish
  fish.x += fish.speed * Math.cos(fish.angle);
  fish.y += fish.speed * Math.sin(fish.angle);

  // Keep the fish within the aquarium boundaries
  if (fish.x < 0 || fish.x > aquariumWidth - fish.width) {
    fish.angle = Math.PI - fish.angle; // reverse horizontal direction
  }
  if (fish.y < 0 || fish.y > aquariumHeight - fish.height) {
    fish.angle = -fish.angle; // reverse vertical direction
  }

  // apply the updated position to the DOM element
  startFish.style.left = `${fish.x}px`;
  startFish.style.top = `${fish.y}px`;
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

// start the animation
animateFish();