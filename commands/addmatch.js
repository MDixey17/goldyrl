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
        .setName('addmatch')
        .setDescription('Add a single match to the database')
        .addStringOption(option => 
            option.setName('team_one')
                .setDescription('Team 1 in the completed match')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('team_one_score')
                .setDescription(`Team 1's score in the completed match`)
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('team_two')
                .setDescription('Team 2 in the completed match')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('team_two_score')
                .setDescription(`Team 2's score in the completed match`)
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('league')
                .setDescription('The league or tournament name')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.name === "GoldyRL Master" || role.name === "Operations")) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#7A0019')
                .setTitle('GoldyRL - Permission Denied')
                .setDescription(`You don't have permission to execute /addmatch.\nOnly GoldyRL, Operations, and Admin users can execute this command.`);
            await interaction.reply( {embeds: [noPermissionEmbed]} );
            return;
        }
        await MatchData.sync();
        
        const teamOne = interaction.options.getString('team_one');
        const teamOneScore = interaction.options.getInteger('team_one_score');
        const teamTwo = interaction.options.getString('team_two');
        const teamTwoScore = interaction.options.getInteger('team_two_score');
        const leagueName = interaction.options.getString('league');

        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('GoldyRL - Added Match')
            .setDescription(`Successfully added the match information to the database for ${teamOne} vs ${teamTwo}`);

        // Get today's date
        var currentDay = new Date();
        var dd = String(currentDay.getDate()).padStart(2, '0');
        var mm = String(currentDay.getMonth() + 1).padStart(2, '0');
        var yyyy = String(currentDay.getFullYear());

        currentDay = mm + '-' + dd + '-' + yyyy;

        const dataEntry = await MatchData.create({
            team_one: teamOne,
            team_one_score: teamOneScore,
            team_two: teamTwo,
            team_two_score: teamTwoScore,
            date: currentDay,
            league: leagueName
        })
        await interaction.reply({ embeds: [embed] });
    }
};