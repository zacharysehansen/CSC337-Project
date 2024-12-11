/*
This section of the javascript is entirely for getting the fish
to move around the aquarium box, as well as animating their reflection
when a wall or boundary in the aquarium is hit
*/

// Set up our API configuration for connecting to the backend. I was 
// working with port 3000, but you can change it if we want
const API_BASE_URL = 'http://64.23.229.25:3000';

// Was having a very hard time making the animations play correctly, until I found
// on Stack Overflow the functions cancelAnimationFrame() and requestAnimationFrame()
let animationFrameId = null;

// Function to load fish data from backend and create fish elements
async function loadUserFish() {
    try {
        const url = `${API_BASE_URL}/user/joe/fish-types`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const userData = await response.json();
        
        
        const fishContainer = document.getElementById('fishContainer');
        // this line of code clears existing fish elements
        fishContainer.innerHTML = '';
        
        if (!userData.fishTypes || userData.fishTypes.length === 0) {
            console.log('No fish found in user inventory');
            return;
        }
        
        // Create fish elements with random starting positions for each fish in user's inventory
        userData.fishTypes.forEach((fish, index) => {
            const fishElement = document.createElement('img');
            fishElement.id = `fish_${index}`;
            fishElement.src = `./imgs/${fish.type}.gif`;
            fishElement.alt = fish.name;
            
            fishElement.style.position = 'absolute';
            
            fishContainer.appendChild(fishElement);
            console.log(`Added fish: ${fish.type} named ${fish.name}`);
        });
        
        // Start the animation system once fish are loaded
        initializeAquarium();
        
    } catch (error) {
        console.error('Error loading fish:', error);
        const fishContainer = document.getElementById('fishContainer');
        fishContainer.innerHTML = '<p>Could not load fish at this time. Please try again later.</p>';
    }
}

function initializeAquarium() {
    // Cancel any existing animation before starting new one
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Create array to store fish objects
    const fishes = [];
    
    // Get DOM elements for all fish and the aquarium container
    const fishContainer = document.getElementById('fishContainer');
    const fishElements = fishContainer.getElementsByTagName('img');
    const aquarium = document.getElementById('aquarium');
    const aquariumWidth = aquarium.clientWidth;
    const aquariumHeight = aquarium.clientHeight;
    
    // Convert existing fish elements into fish objects with their properties
    for (const fishElement of fishElements) {
        fishes.push({
            x: Math.random() * (aquariumWidth - 64), // Random start x position
            y: Math.random() * (aquariumHeight - 64), // Random start y position
            width: 64,  // Width of the fish element
            height: 64, // Height of the fish element
            speed: 1 + Math.random(), // Speed can be really fast 4 fun
            angle: Math.random() * Math.PI * 2, // Random initial swim angle
            direction: 1, // 1 for right, -1 for left
            element: fishElement // Store reference to the DOM element
        });
    }
    
    // Initial direction and reflect each fish if needed
    fishes.forEach(fish => {
        fish.direction = Math.cos(fish.angle) >= 0 ? 1 : -1;
        reflectFish(fish); // Ensure each fish starts facing the correct direction
    });
    
    // Updates the fish position and angle
    function updateFish(fish) {
        // Move the fish
        fish.x += fish.speed * Math.cos(fish.angle);
        fish.y += fish.speed * Math.sin(fish.angle);
        
        // Keep the fish within the aquarium boundaries
        if (fish.x < 0 || fish.x > aquariumWidth - fish.width) {
            fish.angle = Math.PI - fish.angle; // Reverse horizontal direction
            fish.direction *= -1;
            reflectFish(fish); // Flip the gif to swim the other way
        }
        if (fish.y < 0 || fish.y > aquariumHeight - fish.height) {
            fish.angle = -fish.angle; // Reverse vertical direction
        }
        
        // Apply the updated position to the DOM element
        fish.element.style.left = `${fish.x}px`;
        fish.element.style.top = `${fish.y}px`;
    }
    
    // Function to reflect the fish image based on swim direction
    function reflectFish(fish) {
        fish.element.style.transform = fish.direction === 1 ? 'scaleX(-1)' : 'scaleX(1)';
    }
    
    // Initialize and animate the fish
    function animateFish() {
        // Update each fish in the aquarium
        fishes.forEach(updateFish);
        // Continue the animation loop
        animationFrameId = requestAnimationFrame(animateFish);
    }
    
    // Start the animation loop
    animateFish();
}

// Start everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, starting fish loading process...');
    loadUserFish();
    
    // Actualy really helpful. Allows use to resize the window correctly everytime it is changed
    window.addEventListener('resize', () => {
        initializeAquarium();
    });
});