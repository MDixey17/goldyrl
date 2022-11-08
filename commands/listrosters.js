const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Sequelize } = require('sequelize');
const _RosterData = require('../models/RosterData');

// Connect to the database
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'rosters.sqlite',
});

const RosterData = sequelize.define('roster_data', _RosterData);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listrosters')
        .setDescription('List all team names that have rosters stored in the database'),
    async execute(interaction) {
        await RosterData.sync();
        const embed = new EmbedBuilder()
            .setTitle('GoldyRL - Retrieved List of Teams')
            .setColor('#32CD32');
        
        const teamNames = await RosterData.findAll({attributes: ["team_name"]});
        let names = [];
        teamNames.forEach(entry => {
            names.push(entry.team_name);
        });

        let uniqueNames = [...new Set(names.sort())];
        let descriptionString = "The following teams are stored in the rosters database:\n\n";
        let maxDescriptionFlag = false;
        uniqueNames.forEach(element => {
            if (descriptionString.length + String(element).length + 2 < 4095) { 
                descriptionString = descriptionString + String(element) + "\n";
            } else {
                maxDescriptionFlag = true;
            }
        });
        embed.setDescription(descriptionString);
        if (maxDescriptionFlag) {
            embed.setFooter("And more....");
        }
        await interaction.reply({ embeds: [embed] });
    }
}