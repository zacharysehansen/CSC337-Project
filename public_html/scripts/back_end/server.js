const express = require('express');
const mongoose = require('mongoose');
const { User, Fish, Leaderboard } = require('./models');

const app = express();
app.use(express.json());

const PORT = 5000;
const HOST = '127.0.0.1';
const HUNGER_TIMER = 15 * 1000; 

const MONGO_URI = 'mongodb://127.0.0.1:27017/fishyKingdom';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

app.post('/user/:username', (req, res) => {
    User.findOne({ username: req.params.username })
        .then(user => {
            if (!user) {
                return User.create({
                    username: req.params.username,
                    lastAccessed: new Date().toISOString(),
                    coins: 100,
                    level: 1,
                    inventory: []
                });
            }
            user.lastAccessed = new Date().toISOString();
            return user.save();
        })
        .then(user => res.json(user))
        .catch(error => res.status(500).json({ error: error.message }));
});

// Feed fish 
app.post('/user/:username/feed/:fishId', (req, res) => {
    User.findOne({ username: req.params.username })
        .then(user => {
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
                fish.health = 2 < fish.health + 1 ? 2 : fish.health + 1;
            }

            return user.save();
        })
        .then(user => res.json({ message: 'Fish fed successfully' }))
        .catch(error => res.status(error.status || 500).send(error.toString()));
});

// Update fish hunger 
async function updateFishHunger() {
    const users = await User.find({});
    
    for (const user of users) {
        for (const fish of user.inventory) {
            if (!fish.isHungry && fish.beenFed < 2) {
                fish.isHungry = true;
            }
        }
        await user.save();
    }
}

// Reset fish status daily
async function resetDailyFishStatus() {
    const currentTime = new Date();
    const users = await User.find({});

    for (const user of users) {
        const lastAccessedDate = new Date(user.lastAccessed);
        const timeDifference = currentTime - lastAccessedDate;
        const hoursDifference = timeDifference / (1000 * 60 * 60);
        
        if (hoursDifference >= 24) {
            const midnightToday = new Date(currentTime);
            midnightToday.setHours(0, 0, 0, 0);
            
            user.lastAccessed = midnightToday.toISOString();
            
            for (const fish of user.inventory) {
                fish.beenFed = 0;
                fish.beenPet = false;
                fish.isHungry = false;
            }
            
            await user.save();
        }
    }
}

//  periodic tasks
setInterval(updateFishHunger, HUNGER_TIMER);
resetDailyFishStatus();

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
