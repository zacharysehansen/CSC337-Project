// Team: Sameeka Maroli, Zachary Hanse, Jordan Demler
// server.js
// CSC337
// This script creates an express server to handle to send and recieve updates to the MongoDB server =)
// The code handles race conditions for multiple users through a locking system using maps (CSC 452)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { Fish, User, Leaderboard } = require('./models');
const app = express();

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:3000',
        'http://64.23.229.25:5500'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
}));

app.use(express.json());
const PORT = 3000;
const HOST = '0.0.0.0';
const SAVE_TIMER = 15 * 1000;
const MONGO_URI = 'mongodb://64.23.229.25:27017/fishtank';

// Initialize lock system for concurrent operations
const lockMap = new Map();
let isShuttingDown = false;

function acquireLock(userId) {
    if (lockMap.get(userId)) {
        throw { status: 409, message: 'Another operation in progress for this user' };
    }
    lockMap.set(userId, Date.now());
}

function releaseLock(userId) {
    lockMap.delete(userId);
}

// Helper function to update fish health based on beenFed and beenPet status
function updateFishHealth(fish) {
    // If the fish has been both fed and pet, set health to 2
    if (fish.beenFed && fish.beenPet) {
        fish.health = 2;
    }
    // If the fish has been either fed OR pet (but not both), set health to 1
    else if (fish.beenFed || fish.beenPet) {
        fish.health = 1;
    }
    // If neither fed nor pet, health remains at current value
}

app.post('/user/:username', async (req, res) => {
    const username = req.params.username;
    
    try {
        acquireLock(username);
        
        let user = await User.findOne({ username });
        
        if (!user) {
            user = new User({
                username,
                lastAccessed: new Date().toISOString(),
                coins: 100,
                level: 1,
                inventory: []
            });
        } else {
            user.lastAccessed = new Date().toISOString();
        }
        
        await user.save();
        
        const populatedUser = await User.findById(user._id).populate('inventory');
        
        releaseLock(username);
        res.json(populatedUser);
    } catch (error) {
        releaseLock(username);
        res.status(error.status || 500).json({ error: error.message });
    }
});

app.post('/user/:username/feed/:fishName', async (req, res) => {
    // Note that we changed the parameter name to fishName to be more descriptive
    const { username, fishName } = req.params;
   
    try {
        acquireLock(username);
       
        // First, find the user and populate their inventory
        const user = await User.findOne({ username }).populate('inventory');
        if (!user) {
            console.log("No user found!");
            throw { status: 404, message: 'User not found' };
        }

        // Instead of finding by ID, we now search the user's inventory directly for a matching name
        // We use find() instead of findById() since we're searching through an array
        const fish = user.inventory.find(f => f.name === fishName);
        
        if (!fish) {
            console.log("No fish found!");
            throw { status: 404, message: 'Fish not found in inventory' };
        }

        console.log("Fish found!");
        
        // Update the fish's properties
        fish.beenFed = true;
        updateFishHealth(fish);
        
        // Save the entire user document since we modified the embedded inventory
        await user.save();
       
        releaseLock(username);
        res.json({ message: 'Fish fed successfully' });
    } catch (error) {
        console.log(error.message);
        releaseLock(username);
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Pet fish route
app.post('/user/:username/pet/:fishName', async (req, res) => {
    // We now use fishName instead of fishId in the parameters
    const { username, fishName } = req.params;
   
    try {
        // The lock system remains the same to prevent concurrent operations
        acquireLock(username);
       
        // First find the user and get their full inventory
        const user = await User.findOne({ username }).populate('inventory');
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }
       
        // Instead of using findById, we search directly in the user's inventory
        // using the fish name as our search criterion
        const fish = user.inventory.find(f => f.name === fishName);
        
        // If we can't find a fish with that name in the user's inventory,
        // we throw an error
        if (!fish) {
            throw { status: 404, message: 'Fish not found in inventory' };
        }
       
        // Once we've found the right fish, we mark it as having been pet
        fish.beenPet = true;
       
        // The health update logic remains the same
        updateFishHealth(fish);
        
        // Instead of saving just the fish, we save the entire user document
        // since the fish is now part of the user's inventory
        await user.save();
       
        // Release the lock and send success response
        releaseLock(username);
        res.json({ message: 'Fish pet successfully' });
    } catch (error) {
        // Error handling remains the same
        releaseLock(username);
        res.status(error.status || 500).json({ error: error.message });
    }
});

app.get('/user/:username/fish-types', async (req, res) => {
    const { username } = req.params;
    try {
        acquireLock(username);
        
        const user = await User.findOne({ username }).populate('inventory');
        
        if (!user) {
            console.log('this happened');
            throw { status: 404, message: 'User not found' };
        }
        
        const allFishTypes = user.inventory.map(fish => ({
            type: fish.type,
            name: fish.name,
            health: fish.health,
            beenFed: fish.beenFed,
            beenPet: fish.beenPet
        }));
        
        const response = {
            fishTypes: allFishTypes,
            totalFish: allFishTypes.length
        };
        
        releaseLock(username);
        console.log("Fish were returned");
        res.json(response);
    } catch (error) {
        releaseLock(username);
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Helper function to get fish details based on type
function getFishDetails(fishType) {
    // Map of fish types to their basic configurations
    const fishConfigs = {
        starterFish: { name: 'starterFish', cost: 1 },
        clownFish: { name: 'clownFish', cost: 2 },
        blueTang: { name: 'blueTang', cost: 3 },
        eel: { name: 'eel', cost: 4 },
        angel: { name: 'angle', cost: 5 },
        angler: { name: 'angler', cost: 6 },
        jellyfish: { name: 'jellyfish', cost: 7 },
        anchovy: { name: 'anchovy', cost: 8 },
        clam: { name: 'clam', cost: 9 }
    };
    
    return fishConfigs[fishType] || null;
}

app.post('/user/:username/:fishType/buy-fish', async (req, res) => {
    const username = req.params.username;
    const fishType = req.params.fishType;
   
    try {
        const fishDetails = getFishDetails(fishType);
        if (!fishDetails) {
            throw { status: 400, message: 'Invalid fish type' };
        }
       
        const user = await User.findOne({username});
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }
       
        if (user.coins < fishDetails.cost) {
            throw { status: 400, message: 'Insufficient coins' };
        }
       
        const newFish = new Fish({
            name: `${fishDetails.name}`,
            type: fishType,
            health: 0,
            beenFed: false,
            beenPet: false,
            accessories: []
        });
       
        await newFish.save();
       
        user.coins -= fishDetails.cost;
        user.inventory.push(newFish._id);
        const totalFish = user.inventory.length;
        const newLevel = Math.floor(totalFish / 2) + 1;
        if (newLevel > user.level) {
            user.level = newLevel;
        }
        await user.save();
       
        const updatedUser = await User.findOne({ username })
            .populate('inventory');
       
        res.json({
            success: true,
            updatedCoins: user.coins,
            newFish: newFish,
            inventory: updatedUser.inventory,
            level: user.level,
            levelUp: newLevel > user.level - 1
        });
       
    } catch (error) {
        console.error('Error in buy-fish route:', error);
        res.status(error.status || 500).json({
            error: error.message || 'Internal server error',
            success: false
        });
    }
});


async function gracefulShutdown() {
    if (isShuttingDown) {
        console.log('Shutdown already in progress');
        return;
    }
    
    isShuttingDown = true;
    
    try {
        // Close MongoDB connection
        await mongoose.connection.close();
        
        // Release all locks
        lockMap.clear();
        
        console.log('Shutdown complete. Exiting process.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
}

const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});

mongoose.connect(MONGO_URI, {heartbeatFrequencyMS: 1000})
.then(() => {
    console.log('Connected to MongoDB successfully at:', MONGO_URI);
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

mongoose.connection.on('error', err => {
    console.error('MongoDB runtime error:', err);
    if (err.name === 'MongoNetworkError') {
        console.log('Attempting to reconnect to MongoDB...');
        mongoose.connect(MONGO_URI);
    }
});

process.on('SIGTERM', () => {
    console.log('Closing HTTP server...');
    gracefulShutdown();
    server.close(() => {
        console.log('HTTP server closed');
    });
});

// Login route
app.post('/login', async (req, res) => {
    console.log('Login request received:', req.body);
    const { username } = req.body;
    try {
        const user = await User.findOne({ username });
        console.log('User found:', user);
        
        if (!user) {
            console.log('User not found:', username);
            return res.status(401).json({ error: 'User not found' });
        }
        
        console.log('Login successful for:', username);
        res.json({ success: true, user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Signup route: Sameeka trying to implement it so it does not get wiped from the database
app.post('/signup', async (req, res) => {
    const { fullName, email, username } = req.body;
    console.log('Received signup request:', { fullName, email, username });
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists:', username);
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Modified to match Fish schema: Zachary
        const startFish = new Fish({
            name: 'Bubbles',
            type: 'startFish',
            health: 2,
            beenFed: false,     // Changed from 0 to false to match schema
            beenPet: false,
            accessories: []
            // Removed isHungry as it's not in the schema
        });

        const savedStartFish = await startFish.save();

        const user = new User({
            username,
            // Removed fullName and email as they're not in the schema
            lastAccessed: new Date().toISOString(),
            coins: 100,
            level: 1,
            inventory: [savedStartFish._id],
        });

        console.log('Attempting to save user:', user);
        await user.save();
        console.log('User saved successfully:', username);
        res.json({ success: true, user });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            error: 'Server error during signup',
            details: error.message,
        });
    }
});

app.get('/leaderboard/top3', async (req, res) => {
    try {
        const topUsers = await User.find({})
            .sort({ 'inventory.length': -1 })  // Sort by inventory length descending
            .limit(3)                           // Limit to top 3 only
            .select('username inventory level');

        const leaderboardData = topUsers.map(user => ({
            username: user.username,
            level: user.level,
            fishCount: user.inventory.length
        }));

        res.json({
            success: true,
            topPlayers: leaderboardData
        });
    } catch (error) { //debugging
        console.error('Error fetching top players:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching top players',
            details: error.message
        });
    }
});

//zach and jordan working on it

app.post('/user/:username/coins', async (req, res) => {
    const username = req.params.username;
    console.log('Looking for username:', username); // Debug log
    
    try {
        const user = await User.findOne({ username: username }); // Being explicit with the match
        console.log('Found user:', user); // Debug log
       
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            username: user.username,
            coins: user.coins
        });
    } catch (error) {
        console.error('Error fetching user coins:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching user coins',
            details: error.message
        });
    }
});