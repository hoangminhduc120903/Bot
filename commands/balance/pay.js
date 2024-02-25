const { SlashCommandBuilder } = require('discord.js');
const User = require('../../models/Level');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Pays a user an amount')
        .addUserOption((option) =>
            option
            .setName('target')
            .setDescription('The user you\'d want to trade')
            .setRequired(true),
        ).addNumberOption((options) =>
            options
            .setName('amount')
            .setDescription('An amount you\'d to trade')
            .setRequired(true),
        ),

    async execute(interaction, client) {
        const userStoredBalance = await User.findOne({
            userId: interaction.user.id,
            guildId: interaction.guild.id,
        });

        const amount = interaction.options.getNumber('amount');
        const seclectUser = interaction.options.getUser('target');

        if (seclectUser.bot || seclectUser.id == interaction.user.id) {
            return interaction.reply({
                content: 'You cannot send TCON to youself or bot',
                ephemeral: true,
            });
        } else if (amount < 1) {
            return interaction.reply({
                content: 'The amount started must be over 1 TCOIN',
                ephemeral: true,
            });
        } else if (amount > userStoredBalance.balance) {
            return interaction.reply({
                content: 'You do not have enough funds to send that amount',
                ephemeral: true,
            });
        }

        const selectUserBalance = await User.findOne({
            userId: seclectUser.id,
            guildId: interaction.guild.id,
        });

        await User.findOneAndUpdate({
            userId: userStoredBalance.userId,
            guildId: userStoredBalance.guildId,
        }, {
            balance: await userStoredBalance.balance - amount,
        });

        await User.findOneAndUpdate({
            userId: selectUserBalance.userId,
            guildId: selectUserBalance.guildId,
        }, {
            balance: await selectUserBalance.balance + amount,
        });

        await interaction.reply({
            content: `You've sent ${amount} TCOIN to ${seclectUser}`,
            ephemeral: true,
        });

    },
};