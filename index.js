// Import required libraries to use
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, ClientUser, Events, EmbedBuilder } = require("discord.js");
require("dotenv").config();

// Connect to Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds]});

// Store the commands
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Utilize dictionary-like structure --> key = command name, value = exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
    else {
        console.log(`WARNING: The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Wait for the bot to be ready and log when it is
client.once('ready', () => {
    console.log('GoldyRL reporting for duty!');
})

// Respond to messages
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        const errorEmbed = new EmbedBuilder()
            .setColor('#7A0019')
            .setTitle('GoldyRL - Error')
            .setDescription('There was an error while executing this command!');
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true});
    }
});

// GoldyRL logs into Discord
// IMPORTANT: Nothing goes below this line as the client needs to be the last thing to login
client.login(process.env.DISCORD_TOKEN);