const { Client, GatewayIntentBits } = require('discord.js')
require('dotenv').config()

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent, // Needed to read message content in newer versions
	],
})

// Flexible pattern for UUID-like codes
const codePattern = /\b[0-9a-fA-F]{4,8}-[0-9a-fA-F]{2,6}-[0-9a-fA-F]{2,6}-[0-9a-fA-F]{2,6}-?[0-9a-fA-F]{0,12}\b/g

// When the bot is ready, log a message
client.once('ready', () => {
	console.log('Bot is online!')
})

// Listen for messages
client.on('messageCreate', message => {
	// Ignore messages from the bot itself
	if (message.author.bot) return

	// Check if the message contains a code matching our pattern
	if (codePattern.test(message.content)) {
		// Respond with "dzięki"
		message.reply('dzieki')
	}
})

// Log in to Discord with your app's token
client.login(process.env.TOKEN)
