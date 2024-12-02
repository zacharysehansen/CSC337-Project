const express = require('express');
const {User} = require('./scripts/back_end/models.js'); 
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
const PORT = 5000;
const HOST = '127.0.0.1';
const HUNGER_TIMER = 15*1000 //everything is multiplied by 1000 to make them miliseconds


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
                fish.health = 2 < fish.health+ 1 ? 2 : fish.health+ 1;
            }

            return user.save();
        })
        .then(user => {
            const fish = user.inventory.find((f) => f.id === req.params.fishId);
            console.log("Fish fed successfuly")
        })
        .catch(error => {
            res.status(error.status).send(error.toString());
        });
});

app.post('/user/:username/pet/:fishId', (req, res) => {
    User.findOne({ username: req.params.username })
        .then(user => {
            if (!user) {
                throw { status: 404, message: 'User not found' };
            }

            const fish = user.inventory.find(f => f.id === req.params.fishId);
            if (!fish) {
                throw { status: 404, message: 'Fish not found in inventory' };
            }

            if (fish.beenPet) {
                return user.save();
            }

            fish.beenPet = true;
            fish.health = 2 < fish.health+ 1 ? 2 : fish.health+ 1;

            return user.save();
        })
        .then(user => {
            const fish = user.inventory.find(f => f.id === req.params.fishId);
            res.json({ fish, message: 'Fish pet successfully' });
        })
        .catch(error => {
            res.status(error.status).send(error.toString());
        });
});

app.get('/user/:username/fish-status', (req, res) => {
    User.findOne({ username: req.params.username })
        .then(user => {
            if (!user) {
                throw { status: 404, message: 'User not found' };
            }
            res.json({ inventory: user.inventory });
        })
        .catch(error => {
            res.status(error.status).send(error.toString());
        });
});

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

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    lastAccessed: { type: String, required: true },
    coins: { type: Number, required: true, default: 100 },
    level: { type: Number, required: true, default: 1 },
    inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fish' }]
});

const User = mongoose.model('User', userSchema);

const fishSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    health: { type: Number, default: 2 }, // Max health is 2
    isHungry: { type: Boolean, default: true },
    beenFed: { type: Number, default: 0 }, // Max is 2 times per day
    beenPet: { type: Boolean, default: false },
    accessories: { type: [String], default: [] }
});

const Fish = mongoose.model('Fish', fishSchema);

const leaderboardSchema = new mongoose.Schema({
    username: { type: String, required: true },
    fishValue: { type: Number, required: true }
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/fishyKingdom';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

const User = require('./User');
const Fish = require('./Fish');
const Leaderboard = require('./Leaderboard');

module.exports = { User, Fish, Leaderboard };


setInterval(updateFishHunger, HUNGER_TIMER);
resetDailyFishStatus();

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
