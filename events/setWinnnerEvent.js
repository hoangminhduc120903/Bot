// const { Events } = require('discord.js');

// const Vote = require('../models/BettingData');
// const User = require('../models/Level');

// module.exports = {
//     name: Events.InteractionCreate,
//     async execute(interaction) {
//         if (!interaction.guild) return;
//         if (!interaction.message) return;
//         if (!interaction.isButton) return;

//         const data = await Vote.findOne({ Guild: interaction.guild.id, Msg: interaction.m});

//         if (data == null) {
//             console.log('null');
//         }

//         if (interaction.customId === 'teamA') {
//             console.log('Team A');
//         }

//     },
// };