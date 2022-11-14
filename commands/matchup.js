const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Sequelize } = require('sequelize');
const _MatchData = require('../models/MatchData');
const _RosterData = require('../models/RosterData');

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
        await RosterData.sync();
        const teamOne = interaction.options.getString('team_one');
        const teamTwo = interaction.options.getString('team_two');
        const matchupDataOne = await MatchData.findAll({ where: {team_one: teamOne, team_two: teamTwo}});
        const matchupDataTwo = await MatchData.findAll({ where: {team_one: teamTwo, team_two: teamOne}});
        const teamOneRoster = await RosterData.findOne({where: {team_name: teamOne}});
        const teamTwoRoster = await RosterData.findOne({where: {team_name: teamTwo}});

        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('GoldyRL - Found Matchup Data')
            .setDescription(`Matchup between ${teamOne} vs ${teamTwo}`)

        // First, list rosters
        let r1desc = '';
        let r2desc = '';
        if (teamOneRoster) {
            if (teamOneRoster.get('player_one') !== '-') {
                r1desc += teamOneRoster.get('player_one') + "\n";
            }
            if (teamOneRoster.get('player_two') !== '-') {
                r1desc += teamOneRoster.get('player_two') + "\n";
            }
            if (teamOneRoster.get('player_three') !== '-') {
                r1desc += teamOneRoster.get('player_three') + "\n";
            }
            if (teamOneRoster.get('player_four') !== '-') {
                r1desc += teamOneRoster.get('player_four') + "\n";
            }
            if (teamOneRoster.get('player_five') !== '-') {
                r1desc += teamOneRoster.get('player_five') + "\n";
            }
            if (teamOneRoster.get('player_six') !== '-') {
                r1desc += teamOneRoster.get('player_six') + "\n";
            }
        }
        else {
            // No roster found for Team 1
            r1desc = 'Roster Not Found';
        }

        embed.addFields({
            name: `${teamOne}`,
            value: `${r1desc}`,
            inline: true
        });

        if (teamTwoRoster) {
            if (teamTwoRoster.get('player_one') !== '-') {
                r2desc += teamTwoRoster.get('player_one') + "\n";
            }
            if (teamTwoRoster.get('player_two') !== '-') {
                r2desc += teamTwoRoster.get('player_two') + "\n";
            }
            if (teamTwoRoster.get('player_three') !== '-') {
                r2desc += teamTwoRoster.get('player_three') + "\n";
            }
            if (teamTwoRoster.get('player_four') !== '-') {
                r2desc += teamTwoRoster.get('player_four') + "\n";
            }
            if (teamTwoRoster.get('player_five') !== '-') {
                r2desc += teamTwoRoster.get('player_five') + "\n";
            }
            if (teamTwoRoster.get('player_six') !== '-') {
                r2desc += teamTwoRoster.get('player_six') + "\n";
            }
        }
        else {
            // No roster found for Team 2
            r2desc = 'Roster Not Found';
        }
        
        embed.addFields({
            name: `${teamTwo}`,
            value: `${r2desc}`,
            inline: true
        });

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
                {name: String(element.team_two) + ' ' + String(element.team_two_score) + ' - ' + String(element.team_one_score) + ' ' + String(element.team_one),
                    value: String(element.date) + ' - ' + String(element.league),
                    inline: false
                }
            )
        });
        
        await interaction.reply({ embeds: [embed] });
    }
};