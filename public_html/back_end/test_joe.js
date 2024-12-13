const mongoose = require('mongoose');
const fs = require('fs');

// Define the same User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    lastAccessed: { type: String, required: true },
    coins: { type: Number, required: true, default: 100 },
    level: { type: Number, required: true, default: 1 },
    inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fish' }]
});

const User = mongoose.model('User', userSchema);

async function verifyUser() {
    try {
        // Read the username we saved earlier
        const TEST_USERNAME = 'joe';
        
        // Connect to the database
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://64.23.229.25:27017/fishtank');
        
        // Try to find our test user
        const foundUser = await User.findOne({ username: TEST_USERNAME });
        
        if (foundUser) {
            console.log('Successfully found the user!');
            console.log('User details:', foundUser);
            
            // Verify the specific values we set
            console.log('\nVerifying user data:');
            console.log('Username matches:', foundUser.username === TEST_USERNAME);
            console.log('Coins are 500:', foundUser.coins === 500);
            console.log('Level is 3:', foundUser.level === 3);
            
        } else {
            console.log('User not found! The save operation may have failed.');
        }
        
    } catch (error) {
        console.error('Error verifying user:', error);
    } finally {
        
        // Close the database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the verification
verifyUser().then(() => {
    console.log('Verification complete!');
    process.exit(0);
});
