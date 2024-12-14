const express = require('express');
const app = express();

// Mock leaderboard data
let leaderboardData = {
    topLeader: "Player1",
    coins: 100,
    fishCount: 5
};

app.get('/leaderboard', (req, res) => {
    res.json(leaderboardData);
});

// Simulate updates to leaderboard data
setInterval(() => {
    leaderboardData.coins += Math.floor(Math.random() * 10);
    leaderboardData.fishCount += Math.floor(Math.random() * 2);
}, 5000);

app.listen(3000, () => {
    console.log("Server running on http://127.0.0.1:3000");
});
