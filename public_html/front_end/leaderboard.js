// Store this as leaderboard.js
const API_URL = 'http://127.0.0.1:3000';

function initializeLeaderboard() {
    const leaderboardModal = document.getElementById('leaderboardModal');
    const leaderboardButton = document.getElementById('leaderboardButton');
    const closeLeaderboardButton = document.getElementById('closeLeaderboardButton');

    async function fetchLeaderboardData() {
        try {
            const username = checkAuthentication();
            if (!username) return;

            // For testing - remove this once your API endpoint is ready
            const testData = [
                { username: "Player 1", coins: 1500, fishCount: 3 },
                { username: "Player 2", coins: 1200, fishCount: 2 },
                { username: "Player 3", coins: 900, fishCount: 1 }
            ];
            updateLeaderboardDisplay(testData);

           
            const response = await fetch(`${API_URL}/leaderboard`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const leaderboardData = await response.json();
            updateLeaderboardDisplay(leaderboardData);
           
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            const leaderboardContent = document.getElementById('leaderboardContent');
            leaderboardContent.innerHTML = '<p style="color: white;">Could not load leaderboard at this time.</p>';
        }
    }

    function updateLeaderboardDisplay(leaderboardData) {
        const leaderboardContent = document.getElementById('leaderboardContent');
        leaderboardContent.innerHTML = '';

        leaderboardData
            .sort((a, b) => b.coins - a.coins)
            .slice(0, 3)
            .forEach((player, index) => {
                const rankClass = ['first', 'second', 'third'][index];
                const entry = document.createElement('div');
                entry.className = `leaderboard-entry ${rankClass}`;
                entry.innerHTML = `
                    <div class="player-info">
                        <span>${index + 1}</span>
                        <span>${player.username}</span>
                    </div>
                    <div class="stats-info">
                        <span>🪙 ${player.coins}</span>
                        <span>🐟 ${player.fishCount}</span>
                    </div>
                `;
                leaderboardContent.appendChild(entry);
            });
    }

    // Event Listeners
    leaderboardButton.addEventListener('click', () => {
        leaderboardModal.style.display = 'block';
        fetchLeaderboardData();
    });

    closeLeaderboardButton.addEventListener('click', () => {
        leaderboardModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === leaderboardModal) {
            leaderboardModal.style.display = 'none';
        }
    });
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', initializeLeaderboard);