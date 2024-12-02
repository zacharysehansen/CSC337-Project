const express = require('express');
const {User} = require('./scripts/back_end/models.js'); 
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


setInterval(updateFishHunger, HUNGER_TIMER);
resetDailyFishStatus();

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
