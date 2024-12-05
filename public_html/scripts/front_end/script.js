<<<<<<< HEAD
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
=======
// make fish objects for each fish in the container
const fishes = [];
>>>>>>> origin/main

// get DOM elements for all fish
const fishContainer = document.getElementById('fishContainer');
const fishElements = fishContainer.getElementsByTagName('img');

// Convert existing fish elements into fish objects with their properties
for (const fishElement of fishElements) {
    fishes.push({
        x: 100, // start x
        y: 100, // start y
        width: 64, // Width of the fish element
        height: 64, // Height of the fish element
        speed: 2, // speed can be realy fast 4 fun
        angle: Math.random() * Math.PI * 2, // random initial swim angle
        element: fishElement // store reference to the DOM element
    });
}

// Define the aquarium boundaries
<<<<<<< HEAD
const aquarium = document.getElementById('imgDiv');
const aquariumWidth = aquarium.offsetWidth;
const aquariumHeight = aquarium.offsetHeight;
=======
const aquarium = document.getElementById('aquarium');
const aquariumWidth = aquarium.clientWidth;
const aquariumHeight = aquarium.clientHeight;
>>>>>>> origin/main

// Determine initial direction based on the angle
fish.direction = Math.cos(fish.angle) >= 0 ? -1 : 1;
reflectFish(); // Ensure the fish starts facing the correct direction

// updates the fish position and angle
function updateFish(fish) {
    // move the fish
    fish.x += fish.speed * Math.cos(fish.angle);
    fish.y += fish.speed * Math.sin(fish.angle);

<<<<<<< HEAD
  // Keep the fish within the aquarium boundaries
  if (fish.x < 0 || fish.x > aquariumWidth - fish.width) {
    fish.angle = Math.PI - fish.angle; // reverse horizontal direction
    fish.direction *= -1;
    reflectFish(); // flip the gif to swim the other way
  }
  if (fish.y < 0 || fish.y > aquariumHeight - fish.height) {
    fish.angle = -fish.angle; // reverse vertical direction
  }
=======
    // Keep the fish within the aquarium boundaries
    if (fish.x < 0 || fish.x > aquariumWidth - fish.width) {
        fish.angle = Math.PI - fish.angle; // reverse horizontal direction
    }
    if (fish.y < 0 || fish.y > aquariumHeight - fish.height) {
        fish.angle = -fish.angle; // reverse vertical direction
    }
>>>>>>> origin/main

    // apply the updated position to the DOM element
    fish.element.style.left = `${fish.x}px`;
    fish.element.style.top = `${fish.y}px`;
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
    // Update each fish in the aquarium
    fishes.forEach(updateFish);
    requestAnimationFrame(animateFish);
}

<<<<<<< HEAD
// set the initial position of the fish
startFish.style.position = 'absolute';
startFish.style.left = `${fish.x}px`;
startFish.style.top = `${fish.y}px`;
startFish.style.transition = 'transform 0.3s';
=======
// set the initial position of all fish
fishes.forEach(fish => {
    fish.element.style.position = 'absolute';
    fish.element.style.left = `${fish.x}px`;
    fish.element.style.top = `${fish.y}px`;
});
>>>>>>> origin/main

// start the animation
animateFish();