const API_URL = 'http://127.0.0.1:3000'; // Backend URL

// Form helper functions
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

document.addEventListener('DOMContentLoaded', () => {
    // Start creating bubbles periodically
    setInterval(createBubble, 200);

    // Create initial bubbles
    for (let i = 0; i < 15; i++) {
        createBubble();
    }

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = e.target.username.value;

            try {
                console.log('Attempting login for:', username);
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username })
                });

                const data = await response.json();
                console.log('Login response:', data);

                if (data.success) {
                    localStorage.setItem('username', username);
                    window.location.href = '/game.html';
                } else {
                    alert('Login failed: ' + data.error);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Error logging in. Please try again.');
            }
        });
    } else {
        console.error('Login form not found in DOM');
    }

    // Handle signup form submission
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            fullName: e.target.fullName.value,
            email: e.target.email.value,
            username: e.target.username.value,
        };
    
        try {
            console.log('Sending signup request:', formData);
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            const data = await response.json();
            console.log('Signup response:', data);
    
            if (data.success) {
                localStorage.setItem('username', formData.username);
                window.location.href = '/game.html';
            } else {
                alert('Signup failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Error signing up. Please try again.');
        }
    });
});
