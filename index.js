// Import required libraries to use
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, ClientUser, Events, EmbedBuilder } = require("discord.js");
require("dotenv").config();
const { Sequelize } = require('sequelize');

const _MatchData = require('./models/MatchData');
const _RosterData = require('./models/RosterData');

// Connect to the database
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'matchdata.sqlite',
});

const MatchData = sequelize.define('match_data', _MatchData);

const sequelize2 = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'rosters.sqlite',
});

const RosterData = sequelize2.define('roster_data', _RosterData);

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
client.once('ready', async () => {
    // Cleaning the match_history database
    console.log('Removing matches older than 45 days...');
    await MatchData.sync();
    const matchEntries = await MatchData.findAll({ attributes: ['date'] });
    let matchesToDelete = []; // Contains the IDs according to the database
    let today = new Date();
    // Format of date = mm-dd-yyyy
    // Split on the - character
    matchEntries.forEach(e => {
        const entry = e.date.split('-');
        const entryDD = entry[1];
        const entryMM = entry[0];
        const entryYYYY = entry[2];
        const temp = new Date(entryMM + '/' + entryDD + '/' + entryYYYY);
        const diffTime = Math.abs(today - temp); // This is in milliseconds
        const numDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (numDays >= 45) {
            matchesToDelete.push(e.id);
        }
    });

    let deletedMatchesCount = 0;
    for (let i = 0; i < matchesToDelete; i++) {
        deletedMatchesCount += (await MatchData.destroy({ where: { id: matchesToDelete[i]}}));
    }
    console.log('Matches Deleted: ', deletedMatchesCount);

    // Cleaning the roster database
    console.log('Removing rosters older than 180 days...');
    await RosterData.sync();

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

    // Make sure commands are only executed via the #match-history channel
    if (interaction.channel.name !== "match-history") {
        const channelEmbed = new EmbedBuilder()
            .setColor('#7A0019')
            .setTitle('GoldyRL - Wrong Channel')
            .setDescription('Please use the #match-history channel')
        await interaction.reply({ embeds: [channelEmbed] });
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