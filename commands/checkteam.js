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
        .setName('checkteam')
        .setDescription('Check if a specific team exists in the match history database')
        .addStringOption(option => 
            option.setName('team_name')
                .setDescription('Team to be checked')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await MatchData.sync();
        const teamName = interaction.options.getString('team_name');
        const teamOne = await MatchData.findAll({where: {team_one: teamName}});
        if (teamOne.length > 0) {
            const embed = new EmbedBuilder()
                .setTitle(`GoldyRL - ${teamName} does exist`)
                .setDescription(`Data for ${teamName} exists in the match history database`)
                .setColor('#32CD32');

            await interaction.reply({ embeds: [embed] });
        }
        else {
            const teamTwo = await MatchData.findAll({where: {team_two: teamName}});
            if (teamTwo.length > 0) {
                const embed = new EmbedBuilder()
                    .setTitle(`GoldyRL - ${teamName} does exist`)
                    .setDescription(`Data for ${teamName} exists in the match history database`)
                    .setColor('#32CD32');

                await interaction.reply({ embeds: [embed] });
            }
            else {
                const embed = new EmbedBuilder()
                    .setTitle(`GoldyRL - ${teamName} does NOT exist`)
                    .setDescription(`Data for ${teamName} does NOT exist in the match history database`)
                    .setColor('#7A0019');

                await interaction.reply({ embeds: [embed] });
            }
        }
    }
}