const mongoose = require('mongoose');

// Define the Fish schema first since User references it
const fishSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    health: { type: Number, default: 2 },
    isHungry: { type: Boolean, default: true },
    beenFed: { type: Number, default: 0 },
    beenPet: { type: Boolean, default: false },
    accessories: { type: [String], default: [] }
});

// Define the User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    lastAccessed: { type: String, required: true },
    coins: { type: Number, required: true, default: 100 },
    level: { type: Number, required: true, default: 1 },
    inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fish' }]
});

// Create models from our schemas
const Fish = mongoose.model('Fish', fishSchema);
const User = mongoose.model('User', userSchema);

const TEST_USERNAME = 'joe';

async function saveUserWithFish() {
    try {
        // Connect to the database
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://64.23.229.25:27017/fishtank');
        
        // First, create our two fish
        console.log('Creating fish...');
        const startFish = new Fish({
            name: 'Bubbles',
            type: 'startFish',
            health: 2,
            isHungry: true,
            beenFed: 0,
            beenPet: false,
            accessories: []
        });

        const clownFish = new Fish({
            name: 'Nemo',
            type: 'clownFish',
            health: 2,
            isHungry: true,
            beenFed: 0,
            beenPet: false,
            accessories: []
        });

        // Save both fish to get their _id values
        const savedStartFish = await startFish.save();
        const savedClownFish = await clownFish.save();
        console.log('Fish created successfully!');

        // Now create the user with the fish IDs in their inventory
        const newUser = new User({
            username: TEST_USERNAME,
            lastAccessed: new Date().toISOString(),
            coins: 100,
            level: 1,
            inventory: [savedStartFish._id, savedClownFish._id] // Add both fish IDs to inventory
        });

        // Save the user
        const savedUser = await newUser.save();
        
        // Fetch the user with populated fish data to verify everything
        const populatedUser = await User.findById(savedUser._id).populate('inventory');
        console.log('Saved user with username:', TEST_USERNAME);
        console.log('User details:', JSON.stringify(populatedUser, null, 2));
        
    } catch (error) {
        console.error('Error saving user and fish:', error);
        
        // Add specific error handling for duplicate username
        if (error.code === 11000) {
            console.error('A user with username "joe" already exists. Try deleting it first.');
        }
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the save operation
saveUserWithFish().then(() => {
    console.log('Save operation complete!');
    process.exit(0);
});