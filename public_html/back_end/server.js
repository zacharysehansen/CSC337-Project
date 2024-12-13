const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Add this at the top with other requires
const path = require('path');
const { Fish, User, Leaderboard } = require('./models');
const app = express();

// Add CORS middleware that lets use talk with the front end server. Wwe should be able to get rid
//of this when we move onto the droplet
// app.use(cors({
//     origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://0.0.0.0:3000', 'http://64.23.229.25:3000'],
//     methods: ['GET', 'POST'],
//     credentials: true
// }));

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
}));


app.use(express.json());
const PORT = 3000;
const HOST = '0.0.0.0';
const HUNGER_TIMER = 15 * 1000;
const SAVE_TIMER = 15 * 1000;
const MONGO_URI = 'mongodb://64.23.229.25:27017/fishtank';

//This initializes a lock, so multiple users cannot enter the same account
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

// Feed fish route
app.post('/user/:username/feed/:fishId', async (req, res) => {
    const { username, fishId } = req.params;
    
    try {
        acquireLock(username);
        
        // Find user and verify ownership of fish
        const user = await User.findOne({ username }).populate('inventory');
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }
        
        // Find the fish in the user's inventory
        const fish = await Fish.findById(fishId);
        if (!fish || !user.inventory.some(f => f._id.equals(fish._id))) {
            throw { status: 404, message: 'Fish not found in inventory' };
        }
        
        // Validate feeding conditions
        if (fish.beenFed >= 2) {
            throw { status: 400, message: 'Fish cannot be fed anymore today' };
        }
        if (!fish.isHungry) {
            throw { status: 400, message: 'Fish is not hungry' };
        }
        
        // Update fish status
        fish.isHungry = false;
        fish.beenFed += 1;
        if (fish.beenFed === 2) {
            fish.health = Math.min(fish.health + 1, 2);
        }
        
        await fish.save();
        
        releaseLock(username);
        res.json({ message: 'Fish fed successfully' });
    } catch (error) {
        releaseLock(username);
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Get fish types route
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
            isHungry: fish.isHungry
        }));
        
        const response = {
            fishTypes: allFishTypes,
            totalFish: allFishTypes.length
        };
        
        releaseLock(username);
        res.json(response);
    } catch (error) {
        releaseLock(username);
        res.status(error.status || 500).json({ error: error.message });
    }
});


async function updateFishHunger() {
    if (isShuttingDown) return;
    
    try {
        // Update all non-hungry fish to become hungry
        await Fish.updateMany(
            { isHungry: false },
            { $set: { isHungry: true } }
        );
    } catch (error) {
        console.error('Error updating fish hunger:', error);
    }
}


async function gracefulShutdown() {
    if (isShuttingDown) {
        console.log('Shutdown already in progress');
        return;
    }
    
    isShuttingDown = true;
    
    try {
        // Clear all intervals
        clearInterval(hungerInterval);
        
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


const hungerInterval = setInterval(updateFishHunger, HUNGER_TIMER);

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
    // Attempt to reconnect if connection is lost
    if (err.name === 'MongoNetworkError') {
        console.log('Attempting to reconnect to MongoDB...');
        mongoose.connect(MONGO_URI);
    }
});

// Handle shutdown signal
process.on('SIGTERM', () => {
    console.log('Closing HTTP server...');
    gracefulShutdown();
    server.close(() => {
        console.log('HTTP server closed');
    });
});

// Sameeka added from here for login info

// Login 
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
// Signup 
app.post('/signup', async (req, res) => {
    const { fullName, email, username } = req.body;
    console.log('Received signup request:', { fullName, email, username });

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists:', username);
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Create new user
        const user = new User({
            username,
            fullName,
            email,
            lastAccessed: new Date().toISOString(),
            coins: 100,
            level: 1,
            inventory: [],
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


// Serve static files from the front_end directory
app.use(express.static(path.join(__dirname, '../front_end')));

// Root route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front_end/index.html'));
});

app.use(express.static(path.join(__dirname, '..'))); 

app.get('/game', (req, res) => {
    console.log('Game request received');
    const gamePath = path.join(__dirname, '../front_end/game.html');
    console.log('Attempting to serve:', gamePath);
    res.sendFile(gamePath, (err) => {
        if (err) {
            console.error('Error serving game:', err);
            res.status(404).send('Game not found');
        }
    });

    console.log('Response received:', response);

});