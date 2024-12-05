const express = require('express');
const fs = require('fs').promises;
const app = express();
app.use(express.json());

const PORT = 5000;
const HOST = '127.0.0.1';
const HUNGER_TIMER = 15 * 1000;
const SAVE_TIMER = 15 * 1000;
const DATABASE_FILE = './scripts/back_end/database.json';

// Initialize storage and add lockMap for user operations
const storage = {
    users: new Map(),
    leaderboard: new Map()
};

// Create a map to track locks on user operations
const lockMap = new Map();
let isShuttingDown = false;

// Add lock management functions
function acquireLock(userId) {
    // Check if the user is already locked
    if (lockMap.get(userId)) {
        throw { status: 409, message: 'Another operation is in progress for this user' };
    }
    // Set the lock with a timestamp for potential timeout functionality
    lockMap.set(userId, Date.now());
}

function releaseLock(userId) {
    lockMap.delete(userId);
}

// Modify the user route to use locks
app.post('/user/:username', (req, res) => {
    const username = req.params.username;
    
    try {
        // Try to acquire the lock before proceeding
        acquireLock(username);
        
        new Promise((resolve) => {
            let user = storage.users.get(username);
            
            if (!user) {
                user = {
                    username: username,
                    lastAccessed: new Date().toISOString(),
                    coins: 100,
                    level: 1,
                    inventory: []
                };
            } else {
                user.lastAccessed = new Date().toISOString();
            }
            
            storage.users.set(username, user);
            resolve(user);
        })
        .then(user => {
            releaseLock(username); // Release the lock after operation
            res.json(user);
        })
        .catch(error => {
            releaseLock(username); // Make sure to release lock even on error
            res.status(500).json({ error: error.message });
        });
    } catch (error) {
        // Handle lock acquisition failures
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Modify the feed route to use locks
app.post('/user/:username/feed/:fishId', (req, res) => {
    const username = req.params.username;
    
    try {
        acquireLock(username);
        
        new Promise((resolve) => {
            const user = storage.users.get(username);
            if (!user) {
                throw { status: 404, message: 'User not found' };
            }
            const fish = user.inventory.find(f => f.id === req.params.fishId);
            if (!fish) {
                throw { status: 404, message: 'Fish not found in inventory' };
            }
            if (fish.beenFed >= 2) {
                throw { status: 400, message: 'Fish cannot be fed anymore today' };
            }
            if (!fish.isHungry) {
                throw { status: 400, message: 'Fish is not hungry' };
            }
            fish.isHungry = false;
            fish.beenFed += 1;
            if (fish.beenFed === 2) {
                fish.health = Math.min(fish.health + 1, 2);
            }
            storage.users.set(username, user);
            resolve({ message: 'Fish fed successfully' });
        })
        .then(result => {
            releaseLock(username);
            res.json(result);
        })
        .catch(error => {
            releaseLock(username);
            res.status(error.status || 500).json({ error: error.message });
        });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

async function gracefulShutdown() {
    if (isShuttingDown) {
        console.log('Shutdown already in progress');
        return;
    }
    
    isShuttingDown = true;
    
    try {
        // Clear all intervals
        clearInterval(hungerInterval);
        clearInterval(saveInterval);
        
        console.log('Saving final data...');
        await saveToFile();
        
        // Release all locks
        lockMap.clear();
        
        console.log('Shutdown complete. Exiting process.');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
}

app.get('/user/:username/fish-types', (req, res) => {
    const username = req.params.username;
    
    try {
        acquireLock(username);
        
        new Promise((resolve) => {
            const user = storage.users.get(username);
            
            if (!user) {
                throw { status: 404, message: 'User not found' };
            }
            
            if (!user.inventory || user.inventory.length === 0) {
                resolve({ 
                    fishTypes: [],
                    totalFish: 0
                });
                return;
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
            
            resolve(response);
        })
        .then(result => {
            releaseLock(username);
            res.json(result);
        })
        .catch(error => {
            releaseLock(username);
            res.status(error.status || 500).json({ error: error.message });
        });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

// Store interval references so we can clear them during shutdown
const hungerInterval = setInterval(updateFishHunger, HUNGER_TIMER);
const saveInterval = setInterval(saveToFile, SAVE_TIMER);

// Start the server
const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});

// Add server shutdown handling
process.on('SIGTERM', () => {
    console.log('Closing HTTP server...');
    gracefulShutdown();
    server.close(() => {
        console.log('HTTP server closed');
    });
});