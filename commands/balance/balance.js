const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/Level');
const getBalance = require('../../utils/getBalance');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Return your balance'),
    async execute(interaction, client) {
        const seclectUser = interaction.member;
        const storeBalance = await User.findOne({
            userId: seclectUser.id,
            guildId: interaction.guild.id,
        });
        if (!storeBalance) {
            return await interaction.reply({
                content: `${seclectUser}, doesn't have a balance.`,
                ephemeral: true,
            });
        } else {
            const embed = new EmbedBuilder()
                .setColor(0xD6002A)
                .setTitle(`${seclectUser.user.username}`)
                .setTimestamp()
                .addFields([{
                    name: `**${storeBalance.balance}** TCOIN`,
                    value: '\u200b',
                }])
                .setThumbnail('https://cdn.sforum.vn/sforum/wp-content/uploads/2021/07/lol-t1-1.jpg')
                .setFooter({
                    text: seclectUser.user.tag,
                    iconURL: seclectUser.user.displayAvatarURL(),
                });
            await interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
        }
    },
};