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
        .setName('deleteroster')
        .setDescription('Delete the roster for the provided team name')
        .addStringOption(option => 
            option.setName('team_name')
                .setDescription('The name of the team to remove the roster')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.name === "GoldyRL Master" || role.name === "Operations")) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#7A0019')
                .setTitle('GoldyRL - Permission Denied')
                .setDescription(`You don't have permission to execute /deleteroster.\nOnly GoldyRL, Operations, and Admin users can execute this command.`);
            await interaction.reply( {embeds: [noPermissionEmbed]} );
            return;
        }

        await RosterData.sync();
        const teamName = interaction.options.getString('team_name');
        const rosterEntryToDelete = await RosterData.findOne({ where: {team_name: teamName}});
        const deletedEntries = await RosterData.destroy({ where: {id: rosterEntryToDelete.id}});
    
        if (deletedEntries === 0) {
            const embed = new EmbedBuilder()
                .setTitle(`GoldyRL - Cannot find ${teamName}'s roster`)
                .setDescription('Roster does not exist in the database')
                .setColor("#7A0019");
            await interaction.reply({ embeds: [embed] });
        }
        else {
            const embed = new EmbedBuilder()
                .setTitle(`GoldyRL - Removed ${teamName}'s Roster`)
                .setDescription(`Successfully removed ${teamName}'s roster from the database`)
                .setColor("#32CD32");

            await interaction.reply({ embeds: [embed] });
        }
    }
}