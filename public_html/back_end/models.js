const mongoose = require('mongoose');

// Fish Schema
const fishSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    health: { type: Number, default: 2 }, // Max health is 2
    isHungry: { type: Boolean, default: true },
    beenFed: { type: Number, default: 0 }, // Max is 2 times per day
    beenPet: { type: Boolean, default: false },
    accessories: { type: [String], default: [] }
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    lastAccessed: { type: String, required: true },
    coins: { type: Number, required: true, default: 100 },
    level: { type: Number, required: true, default: 1 },
    inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fish' }]
});

// Leaderboard Schema
const leaderboardSchema = new mongoose.Schema({
    username: { type: String, required: true },
    fishValue: { type: Number, required: true }
});

// Create models
const Fish = mongoose.model('Fish', fishSchema);
const User = mongoose.model('User', userSchema);
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// Export all models
module.exports = { Fish, User, Leaderboard };