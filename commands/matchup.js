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
        .setName('matchup')
        .setDescription('Find the matchup history between two teams')
        .addStringOption(option =>
            option.setName('team_one')
                .setDescription('Team 1 in the match')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('team_two')
                .setDescription('Team 2 in the match')
                .setRequired(true)
        ),
    async execute(interaction) {
        await MatchData.sync();
        
        const teamOne = interaction.options.getString('team_one');
        const teamTwo = interaction.options.getString('team_two');
        const matchupDataOne = await MatchData.findAll({ where: {team_one: teamOne, team_two: teamTwo}});
        const matchupDataTwo = await MatchData.findAll({ where: {team_one: teamTwo, team_two: teamOne}});

        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('GoldyRL - Found Matchup Data')
            .setDescription(`Here is the matchup data found for ${teamOne} vs ${teamTwo}`)

        // Iterate through each matchup list
        matchupDataOne.forEach(element => {
            embed.addFields(
                {name: String(element.team_one) + ' ' + String(element.team_one_score) + ' - ' + String(element.team_two_score) + ' ' + String(element.team_two),
                    value: String(element.date) + ' - ' + String(element.league),
                    inline: false
                }
            )
        });
        matchupDataTwo.forEach(element => {
            embed.addFields(
                {name: String(element.team_one) + ' ' + String(element.team_one_score) + ' - ' + String(element.team_two_score) + ' ' + String(element.team_two),
                    value: String(element.date) + ' - ' + String(element.league),
                    inline: false
                }
            )
        });
        
        await interaction.reply({ embeds: [embed] });
    }
};