const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/Level');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('setrank')
        .setDescription('Set your level or another members level')
        .addUserOption((option) =>
            option
            .setName('member')
            .setDescription('Who\'s level are you set?')
            .setRequired(false),
        )
        .addNumberOption((option) =>
            option
            .setName('level')
            .setDescription('What\'s new level?')
            .setRequired(false),
        ),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const member = interaction.options.getUser('member') || interaction.member;
        const newLv = interaction.options.getNumber('level');

        let user;

        const guildId = interaction.guild.id;
        const userId = member.id;
        user = await User.findOne({ guildId, userId });
        try {
            await User.findOneAndUpdate({
                guildId: guildId,
                userId: userId,
            }, {
                level: newLv,
                xp: 0,
            }, { upsert: true, new: true }).then(() => interaction.reply({
                content: `Changed success ${member}'s level to ${newLv}`,
            }));
        } catch (error) {
            console.log(error);
        }
    },
};