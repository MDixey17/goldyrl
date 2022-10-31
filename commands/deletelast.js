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
        .setName('deletelast')
        .setDescription('Delete the most recent match for the provided team')
        .addStringOption(option => 
            option.setName('team_name')
                .setDescription('The name of the team to remove the last recorded match')
                .setRequired(true)
        ),
    async execute(interaction) {
        await MatchData.sync();
        
        const teamName = interaction.options.getString('team_name');
        const teamEntryToDelete = await MatchData.findOne({ where: Sequelize.or({team_one: teamName}, {team_two: teamName}), order: [ [ 'id', 'DESC'] ] });
        const deletedEntries = await MatchData.destroy({ where: {id: teamEntryToDelete.id}});

        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('GoldyRL - Deleted Last Match')
            .setDescription(`Removed last entry for ${teamName}`);

        await interaction.reply({ embeds: [embed] });
    }
};