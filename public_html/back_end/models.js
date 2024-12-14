const mongoose = require('mongoose');

// Fish Schema
const fishSchema = new mongoose.Schema({
    // Basic fish information
    name: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        required: true 
    },
    
    // Health system - starts at 0, increases with interactions
    health: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 2
    },
    
    // Interaction tracking
    beenFed: { 
        type: Boolean, 
        default: false 
    },
    beenPet: { 
        type: Boolean, 
        default: false 
    },
    
    // Customization options
    accessories: { 
        type: [String], 
        default: [] 
    }
});

// User Schema - remains largely the same
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    lastAccessed: { 
        type: String, 
        required: true 
    },
    coins: { 
        type: Number, 
        required: true, 
        default: 100 
    },
    level: { 
        type: Number, 
        required: true, 
        default: 1 
    },
    inventory: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Fish' 
    }]
});

// Leaderboard Schema - remains unchanged
const leaderboardSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true 
    },
    fishValue: { 
        type: Number, 
        required: true 
    }
});

// Create models
const Fish = mongoose.model('Fish', fishSchema);
const User = mongoose.model('User', userSchema);
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

// Export all models
module.exports = { Fish, User, Leaderboard };