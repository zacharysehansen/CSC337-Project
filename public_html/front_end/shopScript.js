/*
Team: Jordan Demler
CSC 337: Pocket Pond
This JavaScript file manages the functionality for the shop in the index.html page, using a modal box to create a pop-up shop interface. 
It handles the initial loading of the shop, purchasing fish, and integrates a modal dialog adapted from W3Schools' tutorial on modals.
*/


var button = document.getElementById("shopButton");

var close = document.getElementById("closeShopButton");

// when the user clicks on the button, open the modal
button.onclick = function() {
    location.href = "shop.html";

  console.log("shopButton")
}

// Get the container holding all fish content
const fishContent = document.getElementById('fishContent');

// Fish prices lookup object - matches backend prices
const fishPrices = {
    sFish: 1,
    cFish: 2,
    bTang: 3,
    eel: 4,
    angel: 5,
    angler: 6,
    jelly: 7,
    anchovy: 8,
    clam: 9
};

// Function to handle fish purchase attempts
async function handleFishPurchase(fishType, price) {
    // Get current user info from localStorage or another source
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        alert('Please log in to purchase fish');
        return;
    }

    try {
        // Make API call to purchase fish
        const response = await fetch(`http://localhost:3000/user/${currentUser}/buy-fish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fishType })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to purchase fish');
        }

        // Update the displayed coin amount with the new balance
        const coinDisplay = document.getElementById('coinDisplay');
        if (coinDisplay) {
            coinDisplay.textContent = data.updatedCoins;
        }

        // Show success message
        alert(`Successfully purchased ${fishType}!`);
        
        // Optionally refresh the fish tank display
        // You might want to call a function here to update the fish tank
        
    } catch (error) {
        alert(error.message);
    }
}

// Add click event listeners to all fish images in the shop
function initializeShopListeners() {
    // Get all fish image containers
    const fishImages = fishContent.querySelectorAll('.fish-image');  // Adjust selector based on your HTML structure

    fishImages.forEach(fishImage => {
        fishImage.addEventListener('click', async () => {
            // Get fish type from data attribute or ID
            const fishType = fishImage.dataset.fishType;  // Make sure to add data-fish-type to your HTML
            const price = fishPrices[fishType];

            if (!price) {
                alert('Invalid fish type');
                return;
            }

            // Get current user's coins
            const coinDisplay = document.getElementById('coinDisplay');
            const currentCoins = parseInt(coinDisplay?.textContent || '0');

            // Check if user can afford the fish
            if (currentCoins < price) {
                alert(`You need ${price} coins to buy this fish. You only have ${currentCoins} coins.`);
                return;
            }

            // If they can afford it, attempt to purchase
            await handleFishPurchase(fishType, price);
        });
    });
}

// Initialize the listeners when the document is ready
document.addEventListener('DOMContentLoaded', initializeShopListeners);



