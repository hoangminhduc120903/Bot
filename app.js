const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');


const {
    Guilds,
    GuildMembers,
    GuildMessages,
    MessageContent,
    GuildMessageReactions,
    GuildPresences,
} = GatewayIntentBits;

const {
    User,
    Message,
    GuildMember,
    ThreadMember,
} = Partials;

const client = new Client({
    intents: [Guilds, GuildMembers, MessageContent, GuildMessages, GuildMessageReactions, GuildPresences],
    partials: [User, Message, GuildMember, ThreadMember],
});

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

(async() => {
    try {
        await mongoose.connect('mongodb+srv://tconisnumber1:2ndrCCDISdvIBimK@tbotdb.yczd5xl.mongodb.net/?retryWrites=true&w=majority', { keepAlive: true });
        console.log('Conected to DB');
        client.login(token);
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();

let ratelimits = [];
client.on('message', (msg) => {
    // APPLYING RATELIMITS
    const appliedRatelimit = ratelimits.find((value) => value.user === msg.author.id && value.channel === msg.channel.id);
    if (appliedRatelimit) {
        // Can they post the message?~
        const canPostMessage = msg.createdAt.getTime() - appliedRatelimit.ratelimit >= appliedRatelimit.lastMessage;
        // They can
        if (canPostMessage) return (ratelimits[ratelimits.indexOf(appliedRatelimit)].lastMessage = msg.createdAt.getTime());
        // They can't
        msg.delete({ reason: 'Enforcing ratelimit.' });
    }
    // SET RATELIMIT
    if (msg.content === '!RateLimit') {
        // Checking it's you
        if (msg.author.id !== 'your id') return msg.reply('You can\'t do that.');
        // You can change these values in function of the received message
        const targetedUserId = 'whatever id you want';
        const targetedChannelId = msg.channel.id;
        const msRateLimit = 2000;
        // 2 seconds // Delete existant ratelimit if any for this user on this channel
        ratelimits = ratelimits.filter((value) => !(value.user === targetedUserId && value.channel === targetedChannelId));
        // Add ratelimit
        ratelimits.push({ user: targetedUserId, channel: targetedChannelId, ratelimit: msRateLimit, lastMessage: 0 });
    }
    // CLEAR RATELIMITS
    if (msg.content === '!clearRateLimits') {
        // Checking it's you
        if (msg.author.id !== 'your id') return msg.reply('You can\'t do that.');
        // Clearing all ratelimits
        ratelimits = [];
    }
});