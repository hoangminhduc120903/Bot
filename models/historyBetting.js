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
    team: {
        type: String,
        default: 'none',
    },
    coinIsBetting: {
        type: Number,
        default: 0,
    },
    date: {
        type: Date,
    },
});

module.exports = mongoose.model('History', levelSchema);