const mongoose = require('mongoose');

const vote = new mongoose.Schema({
    Guild: {
        type: String,
        require: true,
    },
    Msg: {
        type: String,
        require: true,
    },
    matchID: {
        type: String,
        require: true,
    },
    UpMember: {
        type: Array,
    },
    DownMember: {
        type: Array,
    },
    UpVote: {
        type: Number,
        default: 0,
    },
    DownVote: {
        type: Number,
        default: 0,
    },
    Owner: {
        type: String,
    },
    Team1: {
        type: String,
    },
    Team2: {
        type: String,
    },
    LogoTeam1: {
        type: String,
    },
    LogoTeam2: {
        type: String,
    },
    checkBetting: {
        type: String,
        default: 'none',
    },

    money: {
        type: Number,
        default: 0,
    },

    end: {
        type: Boolean,
    },
});

module.exports = mongoose.model('Data', vote);