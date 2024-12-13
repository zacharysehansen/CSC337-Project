const API_URL = 'http://127.0.0.1:3000';
let animationFrameId = null;

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

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, checking authentication...');
    loadUserFish();
    
    window.addEventListener('resize', () => {
        initializeAquarium();
    });
});