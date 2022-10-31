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
        .setDescription('lists all tags from the database'),
    async execute(interaction) {
        await MatchData.sync();
        const embed = new EmbedBuilder()
            .setTitle('GoldyRL - Retrieved List of Teams')
            .setDescription('The following teams are stored in the database:')
            .setColor('#32CD32');
        const teamNames = await MatchData.findAll({attributes: ["team_one", "team_two"]});
        console.log(teamNames);
        teamNames.forEach(element => {
            embed.addFields(
                {name: String(element.team_one), value: "==========", inline: false},
                {name: String(element.team_two), value: "==========", inline: false}
            )
        });
        await interaction.reply({ embeds: [embed] });
    }
};