const express = require('express');
const { Client, GatewayIntentBits, TextChannel } = require('discord.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Store the last detected code
let lastDetectedCode = null;
const codePattern = /\b[0-9a-fA-F]{4,8}-[0-9a-fA-F]{2,6}-[0-9a-fA-F]{2,6}-[0-9a-fA-F]{2,6}-?[0-9a-fA-F]{0,12}\b/;
const monitoredChannelId = '1184882890635489451';

// Helper function to scan messages in the specified channel to find the last code
async function findLastCodeInChannel() {
    try {
        const channel = await client.channels.fetch(monitoredChannelId);
        if (channel instanceof TextChannel) {
            const messages = await channel.messages.fetch({ limit: 100 }); // Fetch the last 100 messages
            for (const message of messages.values()) {
                if (codePattern.test(message.content)) {
                    lastDetectedCode = message.content.match(codePattern)[0];
                    console.log(`Initial code found: ${lastDetectedCode}`);
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

client.once('ready', async () => {
    console.log('Bot is online!');
    await findLastCodeInChannel(); // Scan for the last code when the bot starts
});

client.on('messageCreate', (message) => {
    // Check if the message is in the monitored channel
    if (message.channel.id !== monitoredChannelId) return;

    // Ignore messages from the bot itself
    if (message.author.bot) return;

    // Check if the message contains a code and update the last detected code
    if (codePattern.test(message.content)) {
        lastDetectedCode = message.content.match(codePattern)[0];
        console.log(`Code detected and saved: ${lastDetectedCode}`);
        // Reply with "dzięki" when a code is detected
        message.reply('dzięki').catch(console.error);
    }

    // Check if the message is "dzięki" (case-insensitive)
    if (/^dzieki$/i.test(message.content.trim())) {
        if (lastDetectedCode) {
            message.reply(`${lastDetectedCode}`).catch(console.error);
        } else {
            message.reply('Nwm jaki kod ci mam wysłać, bo nie było żadnego w ostanich 100 wiadomościach.').catch(console.error);
        }
    }
});

// Express server to prevent port timeout
app.get('/', (req, res) => {
    res.send('Discord bot is running');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// Log in to Discord with your app's token
client.login(process.env.TOKEN);
