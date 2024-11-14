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

// Store the last detected code and user tracking
let lastDetectedCode = null;
let userResponseCount = {};
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
    // Ignore messages from the bot itself
    if (message.author.bot) return;

    // Check if the message is in the monitored channel and contains a code
    if (codePattern.test(message.content)) {
        if (message.channel.id === monitoredChannelId) {
            lastDetectedCode = message.content.match(codePattern)[0];
            console.log(`Code detected and saved: ${lastDetectedCode}`);   
        }

        // Check if the user has been responded to 20 times in a row
        if (userResponseCount[message.author.id] >= 20) {
            message.reply('* but nobody came.').catch(console.error);
        } else {
            message.reply('dzięki').catch(console.error);
            userResponseCount[message.author.id] = (userResponseCount[message.author.id] || 0) + 1;
        }
        return;
    }

    // Check if the message is "dzięki" or similar (case-insensitive) in any channel
    if (/^dzieki$/i.test(message.content.trim()) || /^dzięki$/i.test(message.content.trim())) {
        // Check if the user has been responded to 20 times in a row
        if (userResponseCount[message.author.id] >= 20) {
            message.reply('* but nobody came.').catch(console.error);
        } else {
            if (lastDetectedCode) {
                message.reply(`${lastDetectedCode}`).catch(console.error);
            } else {
                message.reply('Nwm jaki kod wysłać, bo w ostatnich 100 wiadomościach go nie było. ').catch(console.error);
            }

            // Update the response count for the user
            userResponseCount[message.author.id] = (userResponseCount[message.author.id] || 0) + 1;
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
