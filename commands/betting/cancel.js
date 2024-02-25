const {
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');

const Vote = require('../../models/BettingData');
const User = require('../../models/Level');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cancel')
        .setDescription('Cancel')
        .addStringOption((option) =>
            option
            .setName('matchid')
            .setDescription('The match id')
            .setRequired(true),
        ),
    async execute(interaction) {
        const matchIDs = interaction.options.getString('matchid');

        const userStoredBalance = await User.findOne({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
        });

        const coin = userStoredBalance.coinBetted;

        const data = await Vote.findOne({ Guild: interaction.guild.id, matchID: matchIDs });
        const msg = await interaction.channel.messages.fetch(data.Msg);

        if (data == null) {
            return await interaction.reply({
                content: 'Cannot find the match',
                ephemeral: true,
            });
        }

        if (data.checkBetting === 'team1') {
            data.checkBetting = 'none';
            const embeds = EmbedBuilder.from(msg.embeds[0])
                .setFields({
                    name: data.Team1,
                    value: `**${data.UpVote - 1}** votes`,
                    inline: true,
                }, {
                    name: data.Team2,
                    value: `**${data.DownVote}** votes`,
                    inline: true,
                })
                .setFooter({
                    text: `Author: ${data.Owner}`,
                });

            await msg.edit({
                embeds: [embeds],
            });

            userStoredBalance.balance += coin;
            data.UpVote--;
            data.UpMember.pull(interaction.user.id);
            data.money -= coin;
            data.save();
            userStoredBalance.save();
            await interaction.reply({
                content: `Cancel successfully! \`${coin} TCOIN\` have been return from your balance\n Please using \`/balance\` command to check your coin\n`,
                ephemeral: true,
            });
        } else if (data.checkBetting === 'team2') {
            data.checkBetting = 'none';
            const embeds = EmbedBuilder.from(msg.embeds[0])
                .setFields({
                    name: data.Team1,
                    value: `**${data.UpVote}** votes`,
                    inline: true,
                }, {
                    name: data.Team2,
                    value: `**${data.DownVote - 1}** votes`,
                    inline: true,
                })
                .setFooter({
                    text: `Author: ${data.Owner}`,
                });

            await msg.reply({
                embeds: [embeds],
            });

            userStoredBalance.balance += coin;
            data.DownVote--;
            data.DownMember.pull(interaction.user.id);
            data.money -= coin;
            data.save();
            userStoredBalance.save();
            await interaction.reply({
                content: `Cancel successfully! \`${coin} TCOIN\` have been return from your balance\n Please using \`/balance\` command to check your coin\n`,
                ephemeral: true,
            });
        }
    },
};