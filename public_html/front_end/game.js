//CSC 337 Final Project: Pocket Pond
//Team: Sameeka Maroli, Jordan Demler, Zachary Hansen
//Description: This script is the core logic for the Pocket Pond game, managing user interactions, aquarium animations, and backend integration.


const API_URL = 'http://64.23.229.25:3000';
//const API_URL= 'http://127.0.0.1:3000';

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
        window.location.href = 'index.html';
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
        
        const LevelData = await fetch(`${API_URL}/user/${username}/level/top3`, {
            method: 'POST',  
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!LevelData.ok) {
            throw new Error(`HTTP error! status: ${coinsData.status}`);
        }

        const level = await LevelData.json();
        let counter = document.getElementById("levelCounter");
        counter.innerText = level.topPlayers[0].level;

        const coinsData = await fetch(`${API_URL}/user/${username}/coins`, {
            method: 'POST',  
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!coinsData.ok) {
            throw new Error(`HTTP error! status: ${coinsData.status}`);
        }


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
    
    // Track the current interaction mode
    let currentMode = null;
    
    // Add the base button class to our buttons for styling
    feedButton.classList.add('control-button');
    cuddleButton.classList.add('control-button');
    
    // Helper function to set custom cursor and manage button states
    function setCustomCursor(imagePath, activeButton) {
        [feedButton, cuddleButton].forEach(button => {
            button.classList.remove('active');
        });
        
        document.body.style.cursor = `url(${imagePath}), auto`;
        activeButton.classList.add('active');
    }
    
    // Helper function to reset cursor and button states
    function resetCursor() {
        document.body.style.cursor = 'auto';
        currentMode = null;
        
        [feedButton, cuddleButton].forEach(button => {
            button.classList.remove('active');
        });
    }

    async function interactWithFish(fishElement, interactionType) {
        try {
            // Log the start of interaction and basic info
            console.log('Starting fish interaction:', {
                interactionType,
                fishId: fishElement.getAttribute('alt'),
                fishPosition: fishElement.getBoundingClientRect()
            });
    
            const username = getCookie('username');
            console.log('Username from cookie:', username);
    
            if (!username) {
                throw new Error('User not authenticated');
            }
    
            const fishId = fishElement.getAttribute('alt');
            const endpoint = `${API_URL}/user/${username}/${interactionType}/${fishId}`;
            console.log('Making request to endpoint:', endpoint);
    
            const response = await fetch(endpoint, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            console.log('Server response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to ${interactionType} fish`);
            }
    
            // Log the fish data before updating
            console.log('Current fish element state:', {
                classList: Array.from(fishElement.classList),
                position: fishElement.getBoundingClientRect(),
                attributes: {
                    alt: fishElement.alt,
                    id: fishElement.id,
                    health: fishElement.getAttribute('data-health')
                }
            });
    
            // Visual feedback logging
            console.log('Adding interaction feedback class');
            fishElement.classList.add('interaction-feedback');
    
            // Get updated fish data
            const fishResponse = await fetch(`${API_URL}/user/${username}/fish-types`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            const userData = await fishResponse.json();
            console.log('Updated fish data received:', userData);
            
            const updatedFish = userData.fishTypes.find(fish => fish.name === fishId);
            console.log('Found matching fish:', updatedFish);
            
            if (updatedFish && updatedFish.health === 1) {
                console.log('Creating coin for fish with health 1');
                
                const fishRect = fishElement.getBoundingClientRect();
                const aquarium = document.getElementById('aquarium');
                const aquariumRect = aquarium.getBoundingClientRect();
    
                console.log('Position calculations:', {
                    fishRect,
                    aquariumRect,
                    calculatedLeft: fishRect.left - aquariumRect.left + (fishRect.width / 2) - 16,
                    calculatedTop: fishRect.top - aquariumRect.top + fishRect.height
                });
    
                const coin = document.createElement('img');
                coin.src = './img/coin.png';
                coin.className = 'coin';
                
                coin.style.left = `${fishRect.left - aquariumRect.left + (fishRect.width / 2) - 16}px`;
                coin.style.top = `${fishRect.top - aquariumRect.top + fishRect.height}px`;
                
                console.log('Created coin element:', {
                    position: {
                        left: coin.style.left,
                        top: coin.style.top
                    },
                    className: coin.className
                });
                
                aquarium.appendChild(coin);
                
                coin.addEventListener('animationend', () => {
                    console.log('Coin animation completed, removing element');
                    coin.remove();
                });
            }
    
            await loadUserFish();
            console.log('Fish data reloaded');
    
        } catch (error) {
            console.error('Detailed error information:', {
                error,
                errorMessage: error.message,
                errorStack: error.stack
            });
            alert(`Failed to ${interactionType} fish. Please try again.`);
        }
    }
    
    // Add click handlers for the buttons
    feedButton.addEventListener('click', () => {
        if (currentMode === 'feed') {
            resetCursor();
            return;
        }
        
        currentMode = 'feed';
        setCustomCursor('./imgs/food.png', feedButton);
    });
    
    cuddleButton.addEventListener('click', () => {
        if (currentMode === 'cuddle') {
            resetCursor();
            return;
        }
        
        currentMode = 'cuddle';
        setCustomCursor('./imgs/petHand.png', cuddleButton);
    });
    
    // Add click handler for the fish container
    fishContainer.addEventListener('click', async (event) => {
        // Only handle clicks on fish images
        if (event.target.tagName === 'IMG' && currentMode) {
            const interactionType = currentMode === 'feed' ? 'feed' : 'pet';
            await interactWithFish(event.target, interactionType);
            resetCursor();
        }
    });

// leaderboard modal and buttons: sameeka added from here

document.addEventListener('DOMContentLoaded', () => {
    // Get leaderboard modal and buttons
    const leaderboard = document.getElementById('leaderboard');
    const leaderboardButton = document.getElementById('leaderboardButton');
    const closeLeaderboardButton = document.getElementById('closeLeaderboardButton');

    leaderboardButton.onclick = function () {
        leaderboard.style.display = "block";
    };

    closeLeaderboardButton.onclick = function () {
        leaderboard.style.display = "none";
    };

    window.onclick = function (event) {
        if (event.target === leaderboard) {
            leaderboard.style.display = "none";
        }
    };

    fetchLeaderboardData();

    setInterval(fetchLeaderboardData, 50000);
});

// Function to fetch leaderboard data from mongoDB
async function fetchLeaderboardData() {
    try {
        const response = await fetch(`${API_URL}/leaderboard/top3`);
        if (!response.ok) {
            throw new Error("Failed to fetch leaderboard data");
        }

        const data = await response.json();
        updateLeaderboard(data.topPlayers[0], data.topPlayers[1], data.topPlayers[2]);
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
    }
}

function updateLeaderboard(player1, player2, player3) {
    document.getElementById('topLeader').textContent = player1.username;
    document.getElementById('leaderLevel').textContent = player1.level;
    document.getElementById('leaderFish').textContent = player1.fishCount;
}

var button = document.getElementById("shopButton");

var close = document.getElementById("closeShopButton");

// when the user clicks on the button, open the modal
button.onclick = function() {
    location.href = "shop.html";

  console.log("shopButton")
}


