const {
    SlashCommandBuilder,
    EmbedBuilder,
} = require('discord.js');

const Vote = require('../../models/BettingData');
const User = require('../../models/Level');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bet')
        .setDescription('Bet')
        .addStringOption((option) =>
            option
            .setName('matchid')
            .setDescription('Match id')
            .setRequired(true),
        )
        .addStringOption((option) =>
            option
            .setName('team')
            .setDescription('Choose team')
            .setRequired(true),
        )
        .addIntegerOption((option) =>
            option
            .setName('tcoin')
            .setDescription('Number of Tcoin')
            .setRequired(true),
        ),
    async execute(interaction) {
        const matchIDs = interaction.options.getString('matchid');
        const team = (interaction.options.getString('team')).toUpperCase();
        const coin = interaction.options.getInteger('tcoin');

        const userStoredBalance = await User.findOne({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
        });

        const data = await Vote.findOne({ Guild: interaction.guild.id, matchID: matchIDs });
        const msg = await interaction.channel.messages.fetch(data.Msg);

        if (team != data.Team1 && team != data.Team2) {
            return await interaction.reply({
                content: 'Cannot find the team',
                ephemeral: true,
            });
        } else if (team == data.Team1) {
            if (data.UpMember.includes(interaction.user.id) || data.UpMember.includes(interaction.user.id)) {
                return await interaction.reply({
                    content: 'You already vote, Using `Cancel` to vote again',
                    ephemeral: true,
                });
            } else {
                try {
                    if (userStoredBalance.bot) {
                        return;
                    } else if (userStoredBalance.balance < coin) {
                        return await interaction.reply({
                            content: 'You do not have enough funds to send that amount',
                            ephemeral: true,
                        });
                    }
                } catch (error) {
                    return await interaction.reply({
                        content: 'Please chat to create your data',
                        ephemeral: true,
                    });
                }
                data.checkBetting = 'team1';
                const embeds = EmbedBuilder.from(msg.embeds[0])
                    .setFields({
                        name: data.Team1,
                        value: `**${data.UpVote + 1}** votes`,
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

                userStoredBalance.balance -= coin;
                userStoredBalance.coinBetted = coin;
                userStoredBalance.save();
                data.UpVote++;
                data.UpMember.push(interaction.user.id);
                data.money += coin;
                data.save();
                await interaction.reply({
                    content: `Betting successfully! \`${coin} TCOIN\` have been taken from your balance\n Please using \`/balance\` command to check your coin\n Or using \`bet!cancel\` to cancel betting`,
                    ephemeral: true,
                });
            }
        } else if (team === data.Team2) {
            if (data.DownMember.includes(interaction.user.id) || data.UpMember.includes(interaction.user.id)) {
                interaction.followUp({
                    content: 'You already vote, Using `Cancel` to vote again',
                    ephemeral: true,
                });
            } else {
                try {
                    if (userStoredBalance.bot) {
                        return;
                    } else if (userStoredBalance.balance < coin) {
                        return await interaction.reply({
                            content: 'You do not have enough funds to send that amount',
                            ephemeral: true,
                        });
                    }
                } catch (error) {
                    return await interaction.reply({
                        content: 'Please chat to create your data',
                        ephemeral: true,
                    });
                }

                data.checkBetting = 'team2';
                const embeds = EmbedBuilder.from(msg.embeds[0])
                    .setFields({
                        name: data.Team1,
                        value: `**${data.UpVote}** votes`,
                        inline: true,
                    }, {
                        name: data.Team2,
                        value: `**${data.DownVote + 1}** votes`,
                        inline: true,
                    })
                    .setFooter({
                        text: `Author: ${data.Owner}`,
                    });

                await msg.edit({
                    embeds: [embeds],
                });

                userStoredBalance.balance -= coin;
                userStoredBalance.coinBetted = coin;
                userStoredBalance.save();
                data.DownVote++;
                data.DownMember.push(interaction.user.id);
                data.money += coin;
                data.save();
                await interaction.reply({
                    content: `Betting successfully! \`${coin} TCOIN\` have been taken from your balance\n Please using \`/balance\` command to check your coin\n Or using \`bet!cancel\` to cancel betting`,
                    ephemeral: true,
                });
            }
        }
    },
};