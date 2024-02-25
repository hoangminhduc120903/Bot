const User = require('../models/Level');
const calcLevelXP = require('../utils/calcLevelXP');

const cooldown = new Set();

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        const guildId = message.guild.id;
        const userId = message.author.id;
        let user;

        if (message.author.bot || !message.guild) return;
        if (cooldown.has(userId)) return;

        const XpAmount = Math.floor(Math.random() * (25 - 15 + 2) + 12);
        // const XpAmount = 1000;

        const query = {
            userId: message.author.id,
            guildId: message.guild.id,
        };


        try {
            user = await User.findOne(query);

            if (user) {
                user.xp += XpAmount;

                if (user.xp > calcLevelXP(user.level)) {
                    user.xp = 0;
                    user.level += 1;
                    const num = parseInt(user.level / 10);
                    const balanceAmount = num * 2 + 2;
                    user.balance += balanceAmount;
                    message.reply(`Congratulations <@${userId}>!\nYou have just reached level **${user.level}**\n**${balanceAmount} TCOIN**  was added your balance`);
                }

                await user.save().catch((e) => {
                    console.log(`Error to saving update level ${e}`);
                    return;
                });
            } else {
                const newLevel = new User({
                    userId: message.author.id,
                    guildId: message.guild.id,
                    xp: XpAmount,
                });

                await newLevel.save();
            }
        } catch (err) {
            console.log(err);
        }

        setTimeout(() => {
            cooldown.delete(message.author.id);
        }, 60 * 1000);
    },
};