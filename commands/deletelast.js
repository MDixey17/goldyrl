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
        if (!interaction.member.roles.cache.some(role => role.name === "GoldyRL Master" || role.name === "Operations")) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#7A0019')
                .setTitle('GoldyRL - Permission Denied')
                .setDescription(`You don't have permission to execute /deletelast.\nOnly GoldyRL, Operations, and Admin users can execute this command.`);
            await interaction.reply( {embeds: [noPermissionEmbed]} );
            return;
        }
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