// this is the javascript file for the index.html page. it gets all the stuff for the shop
// done, including purchasing of fish, and the inital loading. this is simple a pop-up screen

/* 
this is a created pop up uing a 'modal box'
a modal is a dialog box/popup window that is displayed on top of the current page

this code was adjusted by me (jordan) but is directly edited from w3 schools "How TO - CSS/JS Modal"
*/

/*
This section below is for loading the modal for the shop pop up
*/

// get the modal from the index.html page
var modal = document.getElementById("shopModal");

// get the button that opens the modal from the index.html page
var button = document.getElementById("shopButton");

// get the button element that closes the modal from shop.html
var close = document.getElementById("closeShopButton");

// when the user clicks on the button, open the modal
button.onclick = function() {
  modal.style.display = "block";
}

// when the user clicks on the clsoe button, close the modal
close.onclick = function() {
  modal.style.display = "none";
}

// when the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }

  button.addEventListener('click', () => {
    modal.style.display = 'block';
});

close.addEventListener('click', () => {
    modal.style.display = 'none';
});

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



