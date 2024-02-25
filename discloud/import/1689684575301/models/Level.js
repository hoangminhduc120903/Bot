const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    userId: {
        type: String,
        require: true,
    },
    guildId: {
        type: String,
        require: true,
    },
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 1,
    },
    balance: {
        type: Number,
        default: 5,
    },
    coinBetted: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('Level', levelSchema);