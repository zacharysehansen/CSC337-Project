/*
 * Team: Jordan Demler
 * CSC 337: Pocket Pond
 * This JavaScript file manages the functionality for the shop in the index.html page, 
 * using a modal box to create a pop-up shop interface.
 * It handles the initial loading of the shop, purchasing fish, and integrates 
 * a modal dialog adapted from W3Schools' tutorial on modals.
 */

// Get the container holding all fish content
const fishContent = document.getElementById('fishContent');

// Fish prices lookup object - matches backend prices
const fishPrices = {
    starterFish: 1,
    clownFish: 2,
    blueTang: 3,
    eel: 4,
    angel: 5,
    angler: 6,
    jellyfish: 7,
    anchovy: 8,
    clam: 9
};

const API_URL = "http://64.23.229.25:3000";

function checkAuthentication() {
    const username = getCookie('username');
    return username;
}

// Add click event listeners to all fish images in the shop
function initializeShopListeners() {
    // Get all fish image containers
    const fishItems = document.querySelectorAll('.fish-item');
    
    fishItems.forEach(fishImage => {
        const img = fishImage.querySelector('img');
        if (img) {
            const fishType = img.alt;
            const price = fishPrices[fishType];
            
            img.addEventListener('click', () => {
                handleFishPurchase(fishType, price);
            });
        }
    });
}

// Function to handle fish purchase attempts
async function handleFishPurchase(fishType, price) {
    const currentUser = checkAuthentication();
    
    try {
        // Make API call to purchase fish
        const response = await fetch(`${API_URL}/user/${currentUser}/buy-fish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fishType })
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to purchase fish');
        }
        
        // Add fish to aquarium
        addFishToAquarium(fishType);
        
        // Show success message
        alert(`Successfully purchased ${fishType}!`);
        
    } catch (error) {
        alert(error.message);
    }
}

// Initialize the listeners when the document is ready
document.addEventListener('DOMContentLoaded', initializeShopListeners);