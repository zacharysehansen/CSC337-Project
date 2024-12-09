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
}
