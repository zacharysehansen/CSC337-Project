const API_URL = 'http://127.0.0.1:3000'; // Backend URL

document.addEventListener('DOMContentLoaded', function() {
    goBack();
    document.querySelector('.menu-container').style.display = 'flex';
    setInterval(createBubble, 800);
});

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
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

function showForm(formType) {
    const menuContainer = document.querySelector('.menu-container');
    const forms = document.querySelectorAll('.form-container');

    // Hide menu
    menuContainer.classList.add('hidden');

    // Hide all forms
    forms.forEach(form => form.classList.remove('active'));

    // Show the selected form
    const form = document.getElementById(`${formType}Form`);
    if (form) {
        form.classList.add('active');
    }
}

function goBack() {
    const menuContainer = document.querySelector('.menu-container');
    const forms = document.querySelectorAll('.form-container');

    // Hide all forms
    forms.forEach(form => form.classList.remove('active'));

    // Show menu
    menuContainer.classList.remove('hidden');
}

function createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const categories = ['bubble-small', 'bubble-medium', 'bubble-large'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    bubble.classList.add(category);
    const size = category === 'bubble-small' ? Math.random() * 20 + 10 :
                 category === 'bubble-medium' ? Math.random() * 30 + 20 :
                 Math.random() * 40 + 30;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    document.body.appendChild(bubble);
    bubble.addEventListener('animationend', () => {
        bubble.remove();
    });
}

async function handleLogin(event) {
    event.preventDefault();
    const username = event.target.querySelector('input[name="username"]').value;

    try {
        // First check if user exists
        const checkResponse = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username })
        });

        const checkData = await checkResponse.json();

        if (checkData.success) {
            const shouldLogin = confirm('This username already exists. Would you like to login instead?');
            if (shouldLogin) {
                showForm('login');
                // Pre-fill the username in login form
                const loginForm = document.getElementById('loginForm');
                loginForm.querySelector('input[name="username"]').value = formData.username;
            }
            return;
        }

        if (checkData.error === 'User not found') {
            const shouldSignup = confirm('This username does not exist. Would you like to sign up instead?');
            if (shouldSignup) {
                showForm('signup');
                // Pre-fill the username in signup form
                const signupForm = document.getElementById('signupForm');
                signupForm.querySelector('input[name="username"]').value = username;
            }
            return;
        }
        

        if (checkData.success) {
            setCookie('username', username, 7);
            setCookie('userId', checkData.user._id, 7);
            setCookie('userLevel', checkData.user.level, 7);
            window.location.href = 'game.html';
        } else {
            alert('Login failed: ' + (checkData.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error connecting to server. Please try again.');
        console.error('Login error:', error);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const formData = {
        fullName: event.target.querySelector('input[name="fullName"]').value,
        email: event.target.querySelector('input[name="email"]').value,
        username: event.target.querySelector('input[name="username"]').value
    };

    try {
        // First check if username already exists
        const checkResponse = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username: formData.username })
        });

        const checkData = await checkResponse.json();
        
        if (checkData.success) {
            const shouldLogin = confirm('This username already exists. Would you like to login instead?');
            if (shouldLogin) {
                showForm('login');
                // Pre-fill the username in login form
                const loginForm = document.getElementById('loginForm');
                loginForm.querySelector('input[name="username"]').value = formData.username;
            }
            return;
        }

        // If username doesn't exist, proceed with signup
        const signupResponse = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        const signupData = await signupResponse.json();
        
        if (signupData.success) {
            setCookie('username', formData.username, 7);
            setCookie('userId', signupData.user._id, 7);
            setCookie('userLevel', signupData.user.level, 7);
            window.location.href = 'game.html';
        } else {
            alert('Signup failed: ' + (signupData.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error connecting to server. Please try again.');
        console.error('Signup error:', error);
    }
}

// Add form submission handlers
document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('signupForm').addEventListener('submit', handleSignup);