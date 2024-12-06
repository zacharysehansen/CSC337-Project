// Fish animation setup - create array for fish objects and get DOM elements
const fishes = [];
const fishContainer = document.getElementById('fishContainer');
const fishElements = fishContainer.getElementsByClassName('fish');
const aquarium = document.getElementById('aquarium');

// Initialize fish objects - Convert existing fish elements into fish objects with their properties
function initializeFish() {
    for (const fishElement of fishElements) {
        fishes.push({
            x: 100, // start x position
            y: 100, // start y position
            width: 64, // Width of the fish element
            height: 64, // Height of the fish element
            speed: 1, // speed can be really fast 4 fun
            angle: Math.random() * Math.PI * 2, // random initial swim angle
            direction: 1, // 1 for right, -1 for left
            element: fishElement // store reference to the DOM element
        });
    }

    // Set initial position and direction of each fish
    fishes.forEach(fish => {
        // Set initial direction based on angle
        fish.direction = Math.cos(fish.angle) >= 0 ? -1 : 1;
        
        // Set initial CSS properties
        fish.element.style.position = 'absolute';
        fish.element.style.left = `${fish.x}px`;
        fish.element.style.top = `${fish.y}px`;
        fish.element.style.transition = 'transform 0.3s';
        
        // Ensure fish starts facing the correct direction
        reflectFish(fish);
    });
}

// Update fish positions - handles movement and boundary checking
function updateFish(fish) {
    // Move the fish based on its angle and speed
    fish.x += fish.speed * Math.cos(fish.angle);
    fish.y += fish.speed * Math.sin(fish.angle);

    // Keep fish within horizontal aquarium boundaries
    if (fish.x < 0 || fish.x > aquarium.clientWidth - fish.width) {
        fish.angle = Math.PI - fish.angle; // reverse horizontal direction
        fish.direction *= -1; // flip the direction flag
        reflectFish(fish); // flip the gif to swim the other way
    }

    // Keep fish within vertical aquarium boundaries
    if (fish.y < 0 || fish.y > aquarium.clientHeight - fish.height) {
        fish.angle = -fish.angle; // reverse vertical direction
    }

    // Apply the updated position to the DOM element
    fish.element.style.left = `${fish.x}px`;
    fish.element.style.top = `${fish.y}px`;
}

// Function to reflect fish image based on swim direction
function reflectFish(fish) {
    fish.element.style.transform = fish.direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';
}

// Main animation loop - updates all fish positions
function animateFish() {
    fishes.forEach(updateFish);
    requestAnimationFrame(animateFish);
}

// Login/Signup Functions
function showLogin() {
    document.getElementById('loginModal').classList.remove('hidden');
    document.getElementById('modalTitle').innerText = 'Log In';
    const form = document.getElementById('loginForm');
    form.removeEventListener('submit', handleSubmit);
    form.addEventListener('submit', handleSubmit);
    form.dataset.mode = 'login';
}

function showSignUp() {
    document.getElementById('loginModal').classList.remove('hidden');
    document.getElementById('modalTitle').innerText = 'Sign Up';
    const form = document.getElementById('loginForm');
    form.removeEventListener('submit', handleSubmit);
    form.addEventListener('submit', handleSubmit);
    form.dataset.mode = 'signup';
}

function closeModal() {
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('loginForm').reset();
}

// Form submission 
function handleSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const mode = event.target.dataset.mode;

    if (username && password) {
        if (mode === 'signup') {
            // Store user data
            localStorage.setItem('user_' + username, JSON.stringify({
                username,
                password,
                coins: 0,
                fish: []
            }));
            alert('Account created successfully!');
        } else {
            // Check login credentials
            const userData = localStorage.getItem('user_' + username);
            if (userData) {
                const user = JSON.parse(userData);
                if (user.password === password) {
                    alert('Login successful!');
                } else {
                    alert('Invalid password!');
                    return;
                }
            } else {
                alert('User not found!');
                return;
            }
        }
        // Proceed to main app
        enterApp(username);
    } else {
        alert('Please fill in all fields.');
    }
}

// Enter main application after successful login/signup
function enterApp(username) {
    closeModal();
    document.getElementById('splashScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    initializeFish();
    animateFish();
    
    // Store current user
    localStorage.setItem('currentUser', username);
    
    // Initialize or load game state
    const userData = JSON.parse(localStorage.getItem('user_' + username));
    document.getElementById('coinCounter').textContent = userData.coins || 0;
    document.getElementById('fishHealth').value = 2;
}

// Logout function - reset game state and return to splash screen
function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('splashScreen').classList.remove('hidden');
    document.getElementById('loginForm').reset();
    
    // Reset game state
    document.getElementById('coinCounter').textContent = '0';
    document.getElementById('fishHealth').value = 2;
}

function showHelp() {
    alert('Welcome to Pocket Pond!\n\n' +
          '- Watch your fish swim around\n' +
          '- Click on fish to interact with them\n' +
          '- Earn coins by taking care of your fish\n' +
          '- Visit the shop to buy new fish and decorations\n' +
          '- Keep your fish healthy by feeding them regularly');
}

window.addEventListener('load', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        enterApp(currentUser);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleSubmit);
});