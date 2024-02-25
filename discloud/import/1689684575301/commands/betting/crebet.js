const {
    SlashCommandBuilder,
    EmbedBuilder,
    time,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require('discord.js');

const Vote = require('../../models/BettingData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crebet')
        .setDescription('Create a poll betting')
        .addStringOption((option) =>
            option
            .setName('team1')
            .setDescription('The first team')
            .setRequired(true),
        )
        .addStringOption((option) =>
            option
            .setName('team2')
            .setDescription('The second team')
            .setRequired(true),
        )
        .addIntegerOption((option) =>
            option
            .setName('duration')
            .setDescription('Time of form')
            .setRequired(true),
        ),

    async execute(interaction, message) {
        const team1 = (interaction.options.getString('team1')).toUpperCase();
        const team2 = (interaction.options.getString('team2')).toUpperCase();
        const logoTeam1 = interaction.guild.emojis.cache.find(emoji => emoji.name === `logo${team1}`);
        const logoTeam2 = interaction.guild.emojis.cache.find(emoji => emoji.name === `logo${team2}`);
        const duration = interaction.options.getInteger('duration');

        const durationInMilliseconds = duration * 1000;
        const date = new Date(new Date().getTime() + durationInMilliseconds);
        const relative = time(date, 'R');

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(cancel);
        const today = new Date();
        const dates = String(today.getDate()) + String(today.getMonth() + 1) + String(today.getFullYear());
        const times = String(today.getHours()) + String(today.getMinutes()) + String(today.getSeconds());
        const embed = new EmbedBuilder()
            .setColor(0xD6002A)
            .setTitle('Betting System from T88')
            .setDescription(`Match to day: \`${team1}\` **vs** \`${team2}\`\n*The votting will end **${relative}** *.`)
            .setTimestamp()
            .addFields([{
                    name: `Match ID: ${team1 + team2 + dates + times}`,
                    value: ' ',
                },
                {
                    name: `${logoTeam1}: \`${team1}\`(Team A)`,
                    value: '0',
                    inline: true,
                },
                {
                    name: `${logoTeam2}: \`${team2}\`(Team B)`,
                    value: '0',
                    inline: true,
                },
            ])
            .setFooter({
                text: `Author: ${interaction.user.tag}`,
            });

        const poll = await interaction.reply({
            embeds: [embed],
            fetchReply: true,
            components: [row],
        });

        poll.createReactionCollector();
        await Vote.create({
            Msg: poll.id,
            matchID: team1 + team2 + dates + times,
            UpVote: 0,
            DownVote: 0,
            UpMember: [],
            DownMember: [],
            Guild: interaction.guild.id,
            Owner: interaction.user.tag,
            Team1: team1,
            Team2: team2,
            LogoTeam1: logoTeam1,
            LogoTeam2: logoTeam2,
        });

        const filter = (user) =>
            user.id === message.author.id || !user.bot;
        const reactionCollector = poll.createReactionCollector({
            filter,
            time: duration * 1000,
        });

        reactionCollector.on('end', async() => {
            const data = await Vote.findOne({ Guild: interaction.guild.id, Msg: poll.id });
            data.end = true;
            data.save();
            await poll.delete();
            const embedCloset = new EmbedBuilder()
                .setColor(0xD6002A)
                .setTitle('Time\'s up!')
                .setDescription('The votting has been closed.\n Please choose the winner team')
                .addFields([{
                    name: `Match ID: ${team1 + team2 + dates + times}`,
                    value: ' ',
                }, {
                    name: `${logoTeam1}: \`${data.UpVote}\``,
                    value: `${logoTeam2}**: \`${data.DownVote}\`**`,
                }])
                .setTimestamp()
                .setFooter({
                    text: `Author: ${data.Owner}`,
                });
            await interaction.channel.send({
                embeds: [embedCloset],
                fetchReply: true,
            });
        });

    },
};