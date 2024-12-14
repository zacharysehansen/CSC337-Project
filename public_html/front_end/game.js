//CSC 337 Final Project: Pocket Pond
//Team: Sameeka Maroli, Jordan Demler, Zachary Hansen
//Description: This script is the core logic for the Pocket Pond game, managing user interactions, aquarium animations, and backend integration.


const API_URL = 'http://127.0.0.1:3000';
let animationFrameId = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, checking authentication...');
    
    // Initialize fish and aquarium
    loadUserFish();
    window.addEventListener('resize', initializeAquarium);
    
    // Initialize buttons
    initializeButtons();

    // Initialize leaderboard modal
    initializeLeaderboard();

    // Fetch leaderboard data periodically
    fetchLeaderboardData();
    setInterval(fetchLeaderboardData, 1);
});

function initializeButtons() {
    const feedButton = document.getElementById('feedButton');
    const cuddleButton = document.getElementById('cuddleButton');
    const fishContainer = document.getElementById('fishContainer');
    const coinsCount = document.getElementById('coinCounter');

    let currentMode = null;

    // Add click handlers
    feedButton.addEventListener('click', () => toggleMode('feed', feedButton, './imgs/food.png'));
    cuddleButton.addEventListener('click', () => toggleMode('cuddle', cuddleButton, './imgs/petHand.png'));
    fishContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'IMG' && currentMode) {
            console.log(`Fish interaction (${currentMode})!`);
            resetCursor();
        }
    });

    function updateCoins() {
        coins = coinsCount.innerText
        coins = parseInt(coins)
        coins += 10
        coinsCount.innerText = coins
    }

    function toggleMode(mode, button, cursorImage) {
        if (currentMode === mode) {
            resetCursor();
            return;
        }
        updateCoins();
        currentMode = mode;
        document.body.style.cursor = `url(${cursorImage}), auto`;
        feedButton.classList.remove('active');
        cuddleButton.classList.remove('active');
        button.classList.add('active');
    }

    function resetCursor() {
        document.body.style.cursor = 'auto';
        currentMode = null;
        feedButton.classList.remove('active');
        cuddleButton.classList.remove('active');
    }
}

function initializeLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    const leaderboardButton = document.getElementById('leaderboardButton');
    const closeLeaderboardButton = document.getElementById('closeLeaderboardButton');
    leaderboard.style.display = 'none'

    leaderboardButton.onclick = () => (leaderboard.style.display = 'block');
    closeLeaderboardButton.onclick = () => (leaderboard.style.display = 'none');
    window.onclick = (event) => {
        if (event.target === leaderboard) {
            leaderboard.style.display = 'none';
        }
    };
}

function getCookie(name) {
    const cookieName = name + "=";
    const cookies = document.cookie.split(';');
    for(let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}

function checkAuthentication() {
    const username = getCookie('username');
    if (!username) {
        window.location.href = 'login.html';
        return null;
    }
    return username;
}

async function loadUserFish() {
    try {
        const username = checkAuthentication();
        if (!username) return;

        const response = await fetch(`${API_URL}/user/${username}/fish-types`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const userData = await response.json();
        const fishContainer = document.getElementById('fishContainer');
        fishContainer.innerHTML = '';
        
        if (!userData.fishTypes || userData.fishTypes.length === 0) {
            console.log('No fish found in user inventory');
            return;
        }
        
        userData.fishTypes.forEach((fish, index) => {
            const fishElement = document.createElement('img');
            fishElement.id = `fish_${index}`;
            fishElement.src = `./imgs/${fish.type}.gif`;
            fishElement.alt = fish.name;
            fishElement.setAttribute('data-health', fish.health);
            fishElement.setAttribute('data-hungry', fish.isHungry);
            
            // Add status indicators for health and hunger
            if (fish.isHungry) {
                fishElement.classList.add('hungry');
            }
            if (fish.health < 2) {
                fishElement.classList.add('unhealthy');
            }
            
            fishElement.style.position = 'absolute';
            fishContainer.appendChild(fishElement);
            console.log(`Added fish: ${fish.type} named ${fish.name}`);
        });
        
        initializeAquarium();
        
    } catch (error) {
        console.error('Error loading fish:', error);
        const fishContainer = document.getElementById('fishContainer');
        fishContainer.innerHTML = '<p>Could not load fish at this time. Please try again later.</p>';
    }
}

function initializeAquarium() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    const fishes = [];
    const fishContainer = document.getElementById('fishContainer');
    const fishElements = fishContainer.getElementsByTagName('img');
    const aquarium = document.getElementById('aquarium');
    const aquariumWidth = aquarium.clientWidth;
    const aquariumHeight = aquarium.clientHeight;
    
    for (const fishElement of fishElements) {
        fishes.push({
            x: Math.random() * (aquariumWidth - 64),
            y: Math.random() * (aquariumHeight - 64),
            width: 64,
            height: 64,
            speed: 1 + Math.random(),
            angle: Math.random() * Math.PI * 2,
            direction: 1,
            element: fishElement
        });
    }
    
    fishes.forEach(fish => {
        fish.direction = Math.cos(fish.angle) >= 0 ? 1 : -1;
        reflectFish(fish);
    });
    
    function updateFish(fish) {
        fish.x += fish.speed * Math.cos(fish.angle);
        fish.y += fish.speed * Math.sin(fish.angle);
        
        if (fish.x < 0 || fish.x > aquariumWidth - fish.width) {
            fish.angle = Math.PI - fish.angle;
            fish.direction *= -1;
            reflectFish(fish);
        }
        if (fish.y < 0 || fish.y > aquariumHeight - fish.height) {
            fish.angle = -fish.angle;
        }
        
        fish.element.style.left = `${fish.x}px`;
        fish.element.style.top = `${fish.y}px`;
    }
    
    function reflectFish(fish) {
        fish.element.style.transform = fish.direction === 1 ? 'scaleX(-1)' : 'scaleX(1)';
    }
    
    function animateFish() {
        fishes.forEach(updateFish);
        animationFrameId = requestAnimationFrame(animateFish);
    }
    
    animateFish();
}

// Helper function to reset cursor and button states
function resetCursor() {
    document.body.style.cursor = 'auto';
    currentMode = null;
    
    // Remove active class from all buttons
    [feedButton, cuddleButton].forEach(button => {
        button.classList.remove('active');
    });
}
    
// Function to fetch leaderboard data
async function fetchLeaderboardData() {
    try {
        const response = await fetch(`${API_URL}/leaderboard`);
        if (!response.ok) {
            throw new Error("Failed to fetch leaderboard data");
        }

        const data = await response.json();

        // Update leaderboard dynamically
        updateLeaderboard(data.topLeader, data.coins, data.fishCount);
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
    }
}

// Function to update leaderboard content
function updateLeaderboard(topLeader, coins, fishCount) {
    document.getElementById('topLeader').textContent = topLeader;
    document.getElementById('leaderCoins').textContent = coins;
    document.getElementById('leaderFish').textContent = fishCount;
}


