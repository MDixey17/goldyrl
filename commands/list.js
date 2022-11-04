const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Sequelize } = require('sequelize');
const _MatchData = require('../models/MatchData');

// Connect to the database
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'matchdata.sqlite',
});

const MatchData = sequelize.define('match_data', _MatchData);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('List all team names from the database'),
    async execute(interaction) {
        await MatchData.sync();
        const embed = new EmbedBuilder()
            .setTitle('GoldyRL - Retrieved List of Teams')
            .setColor('#32CD32');
        const teamNames = await MatchData.findAll({attributes: ["team_one", "team_two"]});
        let names = [];
        teamNames.forEach(element => {
            names.push(element.team_one);
            names.push(element.team_two);
        })
        let uniqueNames = [...new Set(names)];
        let descriptionString = "The following teams are stored in the database:\n\n";
        uniqueNames.forEach(element => {
            descriptionString = descriptionString + String(element) + " | ";
        });
        embed.setDescription(descriptionString);
        await interaction.reply({ embeds: [embed] });
    }
};