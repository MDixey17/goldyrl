// Import required libraries to use
const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

// Connect to Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds]});

// Wait for the bot to be ready and log when it is
client.once('ready', () => {
    console.log('GoldyRL reporting for duty!');
})

// GoldyRL logs into Discord
// IMPORTANT: Nothing goes below this line as the client needs to be the last thing to login
client.login(process.env.DISCORD_TOKEN);