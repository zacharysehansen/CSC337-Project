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
        speed: 2, // speed can be realy fast 4 fun
        angle: Math.random() * Math.PI * 2, // random initial swim angle
        element: fishElement // store reference to the DOM element
    });
}

// Define the aquarium boundaries
const aquarium = document.getElementById('aquarium');
const aquariumWidth = aquarium.clientWidth;
const aquariumHeight = aquarium.clientHeight;

// updates the fish position and angle
function updateFish(fish) {
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
    fish.element.style.left = `${fish.x}px`;
    fish.element.style.top = `${fish.y}px`;
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
});

// start the animation
animateFish();;