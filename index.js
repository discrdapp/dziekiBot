const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;  // Use a specified port or default to 3000

// Discord Bot Setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// When the bot is ready, log a message
client.once('ready', () => {
    console.log('Bot is online!');
});

// Listen for messages
client.on('messageCreate', (message) => {
    if (message.author.bot || message.content.startsWith("dzięki")) return;

    const codePatternInstance = new RegExp(/\b[0-9a-fA-F]{4,8}-[0-9a-fA-F]{2,6}-[0-9a-fA-F]{2,6}-[0-9a-fA-F]{2,6}-?[0-9a-fA-F]{0,12}\b/);

    if (codePatternInstance.test(message.content)) {
        message.reply('dzięki').catch(console.error);
    }
});

// Log in to Discord with your app's token
client.login(process.env.TOKEN);

// Express server to prevent port timeout
app.get('/', (req, res) => {
    res.send('Discord bot is running');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
