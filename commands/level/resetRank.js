const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/Level');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetrank')
        .setDescription('Reset your level or another members level')
        .addUserOption((option) =>
            option
            .setName('member')
            .setDescription('Who\'s level are you want to reset?')
            .setRequired(false),
        ),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const member = interaction.options.getUser('member') || interaction.member;

        let user;
        const guildId = interaction.guild.id;
        const userId = member.id;
        user = await User.findOne({ guildId, userId });
        try {
            await User.findOneAndUpdate({
                guildId: guildId,
                userId: userId,
            }, {
                level: 1,
                xp: 0,
            }, { upsert: true, new: true }).then(() => interaction.reply({
                content: `Reset success ${member} to level 1`,
            }));
        } catch (error) {
            console.log(error);
        }
    },
};