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
        .setName('getroster')
        .setDescription('Get the roster for a specified team')
        .addStringOption(option => 
            option.setName('team_name')
                .setDescription('Desired team for data retrieval')
                .setRequired(true)
        ),
    async execute(interaction) {
        await RosterData.sync();
        const teamName = interaction.options.getString("team_name");
        const rosterInfo = await RosterData.findOne({where: {team_name: teamName}});
        if (rosterInfo) {
            let descString = `The stored roster for ${teamName}:\n`;
            const embed = new EmbedBuilder()
                .setTitle(`GoldyRL - ${teamName}'s roster`)
                .setColor("#32CD32");

            if (rosterInfo.get('player_one') !== '-') {
                descString += rosterInfo.get('player_one') + "\n";
            }
            if (rosterInfo.get('player_two') !== '-') {
                descString += rosterInfo.get('player_two') + "\n";
            }
            if (rosterInfo.get('player_three') !== '-') {
                descString += rosterInfo.get('player_three') + "\n";
            }
            if (rosterInfo.get('player_four') !== '-') {
                descString += rosterInfo.get('player_four') + "\n";
            }
            if (rosterInfo.get('player_five') !== '-') {
                descString += rosterInfo.get('player_five') + "\n";
            }
            if (rosterInfo.get('player_six') !== '-') {
                descString += rosterInfo.get('player_six') + "\n";
            }
            embed.setDescription(descString);
            await interaction.reply({ embeds: [embed] });
        }
        else {
            const embed = new EmbedBuilder()
                .setTitle(`GoldyRL - Cannot find ${teamName}'s roster`)
                .setDescription('Roster does not exist in the database')
                .setColor("#7A0019");
            await interaction.reply({ embeds: [embed] });
        }
    }

}