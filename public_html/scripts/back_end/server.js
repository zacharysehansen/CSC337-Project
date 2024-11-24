const express = require('express');
const {User} = require('./models'); 
const app = express();
app.use(express.json());
const PORT = 5000;
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

            if (fish.BeenFed >= 2) {
                throw { status: 400, message: 'Fish cannot be fed anymore today' };
            }

            if (!fish.isHungry) {
                throw { status: 400, message: 'Fish is not hungry' };
            }

            fish.isHungry = false;
            fish.BeenFed += 1;

            if (fish.BeenFed === 2) {
                fish.health = 2 < fish.health+ 1 ? 2 : fish.health+ 1;
            }

            return user.save();
        })
        .then(user => {
            const fish = user.inventory.find((f) => f.id === req.params.fishId);
            console.log("Fish fed successfuly")
        })
        .catch(error => {
            const status = error.status || 500;
            const message = error.message || error.toString();
            res.status(status).json({ error: message });
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

            if (fish.BeenPet) {
                return user.save();
            }

            fish.BeenPet = true;
            fish.health = 2 < fish.health+ 1 ? 2 : fish.health+ 1;

            return user.save();
        })
        .then(user => {
            const fish = user.inventory.find(f => f.id === req.params.fishId);
            res.json({ fish, message: 'Fish pet successfully' });
        })
        .catch(error => {
            const status = error.status || 500;
            const message = error.message || error.toString();
            res.status(status).json({ error: message });
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
            const status = error.status || 500;
            const message = error.message || error.toString();
            res.status(status).json({ error: message });
        });
});

async function updateFishHunger() {
    try {
        const users = await User.find({});
        
        for (const user of users) {
            for (const fish of user.inventory) {
                if (!fish.isHungry && fish.BeenFed < 2) {
                    fish.isHungry = true;
                }
            }
            await user.save();
        }
    } catch (error) {
        console.error('Error updating fish hunger:', error);
        throw error;
    }
}

async function resetDailyFishStatus() {
    try {
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
                    fish.BeenFed = 0;
                    fish.BeenPet = false;
                    fish.isHungry = false;
                }
                
                await user.save();
            }
        }
    } catch (error) {
        console.error('Error resetting fish status:', error);
        throw error;
    }
}


setInterval(updateFishHunger, HUNGER_TIMER);
resetDailyFishStatus();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});