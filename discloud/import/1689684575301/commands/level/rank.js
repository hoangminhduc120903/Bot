const { AttachmentBuilder, SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/Level');
const { Rank } = require('canvacord');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check your level'),
    async execute(interaction) {
        const member = interaction.member;
        let user;
        const guildId = interaction.guild.id;
        const userId = member.id;

        user = await User.findOne({ guildId, userId });

        if (!user) {
            user = {
                level: 1,
                xp: 0,
            };
        }
        const background = '';
        const rank = new Rank()
            .setAvatar(member.user.displayAvatarURL())
            .setCurrentXP(user.xp)
            .setLevel(user.level)
            .setRank(0, 0, false)
            .setRequiredXP(user.level * 250)
            .setStatus(member.presence.status)
            .setProgressBar('#FFFFFF', 'COLOR')
            .setUsername(member.user.username)
            .setBackground('IMAGE', 'https://pbs.twimg.com/media/Ec47_nRWsAAW6Z0.jpg')
            .setDiscriminator(member.user.discriminator);

        rank.build().then((data) => {
            interaction.reply({
                files: [new AttachmentBuilder(data, { name: 'Rank.png' })],
            });
        });
    },
};