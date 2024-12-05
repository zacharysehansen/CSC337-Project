// make fish objects for each fish in the container
const fishes = [];

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
        speed: 1, // speed can be realy fast 4 fun
        angle: Math.random() * Math.PI * 2, // random initial swim angle
        direction: 1, // 1 for right, -1 for left
        element: fishElement // store reference to the DOM element
    });
}

// Define the aquarium boundaries
const aquarium = document.getElementById('aquarium');
const aquariumWidth = aquarium.clientWidth;
const aquariumHeight = aquarium.clientHeight;

// initial direction and reflect each fish if needed
fishes.forEach(fish => {
    fish.direction = Math.cos(fish.angle) >= 0 ? -1 : 1;
    reflectFish(fish); // ensure each fish starts facing the correct direction
});

// updates the fish position and angle
function updateFish(fish) {
    // move the fish
    fish.x += fish.speed * Math.cos(fish.angle);
    fish.y += fish.speed * Math.sin(fish.angle);

    // Keep the fish within the aquarium boundaries
    if (fish.x < 0 || fish.x > aquariumWidth - fish.width) {
        fish.angle = Math.PI - fish.angle; // reverse horizontal direction
        fish.direction *= -1;
        reflectFish(fish); // flip the gif to swim the other way
    }
    if (fish.y < 0 || fish.y > aquariumHeight - fish.height) {
        fish.angle = -fish.angle; // reverse vertical direction
    }

    // apply the updated position to the DOM element
    fish.element.style.left = `${fish.x}px`;
    fish.element.style.top = `${fish.y}px`;
}

// function to reflect the fish
function reflectFish(fish) {
    if (fish.direction === 1) {
        fish.element.style.transform = 'scaleX(1)';
    } else {
        fish.element.style.transform = 'scaleX(-1)';
    }
}

// initialize and animate the fish
function animateFish() {
    // Update each fish in the aquarium
    fishes.forEach(updateFish);
    requestAnimationFrame(animateFish);
}

// set the initial position of all fish
fishes.forEach(fish => {
    fish.element.style.position = 'absolute';
    fish.element.style.left = `${fish.x}px`;
    fish.element.style.top = `${fish.y}px`;
    fish.element.style.transition = 'transform 0.3s';
});

// start the animation
animateFish();