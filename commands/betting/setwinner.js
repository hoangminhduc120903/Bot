const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require('discord.js');

const Vote = require('../../models/BettingData');
const User = require('../../models/Level');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwinner')
        .setDescription('Set winner team')
        .addStringOption((option) =>
            option
            .setName('matchid')
            .setDescription('The match id')
            .setRequired(true),
        ),
    async execute(interaction) {
        const matchIDs = interaction.options.getString('matchid');

        const data = await Vote.findOne({ Guild: interaction.guild.id, matchID: matchIDs });

        if (data == null) {
            return await interaction.reply({
                content: 'Cannot find the match',
                ephemeral: true,
            });
        } else if (data.end == false) {
            return await interaction.reply({
                content: 'Please wait the poll end!!!',
                ephemeral: true,
            });
        } else {
            const teamA = new ButtonBuilder()
                .setCustomId('team1')
                .setLabel(data.Team1)
                .setStyle(ButtonStyle.Primary);

            const teamB = new ButtonBuilder()
                .setCustomId('team2')
                .setLabel(data.Team2)
                .setStyle(ButtonStyle.Primary);

            const cancel = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(cancel, teamA, teamB);

            const response = await interaction.reply({
                content: 'Choose the team winner',
                components: [row],
                ephemeral: true,
            });

            const collectorFilter = i => i.user.id === interaction.user.id;
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });

            if (confirmation.customId === 'team1') {
                const arrMember = data.UpMember;
                const tcoin = data.money / data.UpVote;

                arrMember.forEach(async(member) => {
                    const user = await User.findOne({
                        userId: member,
                        guildId: interaction.guild.id,
                    });

                    const filter = { userId: member, guildId: interaction.guild.id };
                    const update = { balance: user.balance + user.coinBetted + tcoin };

                    // `doc` is the document _before_ `update` was applied
                    let doc = await User.findOneAndUpdate(filter, update);
                    // selectUserBalance.save();
                });
                data.money = 0;
                data.save();
                return await confirmation.reply({
                    content: 'Set winner successfully !!!',
                    ephemeral: true,
                });
            } else if (confirmation.customId === 'teamB') {
                const arrMember = data.DownMember;
                const tcoin = data.money / data.DownVote;
                arrMember.forEach(async(member) => {
                    const user = await User.findOne({
                        userId: member,
                        guildId: interaction.guild.id,
                    });

                    const filter = { userId: member, guildId: interaction.guild.id };
                    const update = { balance: user.balance + user.coinBetted + tcoin };

                    // `doc` is the document _before_ `update` was applied
                    let doc = await User.findOneAndUpdate(filter, update);
                });
                data.money = 0;
                data.save();
                return await confirmation.reply({
                    content: 'Set winner successfully !!!',
                    ephemeral: true,
                });
            } else if (confirmation.customId === 'cancel') {
                return await confirmation.reply({
                    content: 'Cancel successfully !!!',
                    ephemeral: true,
                });
            }

        }
    },
};