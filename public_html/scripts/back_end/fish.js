const mongoose = require('mongoose');

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

module.exports = Fish;
