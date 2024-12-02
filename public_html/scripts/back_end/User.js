const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    lastAccessed: { type: String, required: true },
    coins: { type: Number, required: true, default: 100 },
    level: { type: Number, required: true, default: 1 },
    inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fish' }]
});

const User = mongoose.model('User', userSchema);
