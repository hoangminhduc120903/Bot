const User = require('../models/Level');

module.exports = (client) => {
    client.getBalance = async(userId, guildId) => {
        const storeBalance = await User.findOne({
            userId: userId,
            guildId: guildId,
        });
        if (!storeBalance) {
            console.log('fail');
            return false;
        } else {
            return storeBalance;
        }
    };
};