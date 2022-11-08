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
        .setName('rostersub')
        .setDescription('Substitute a player for a specific team')
        .addStringOption(option => 
            option.setName('team_name')
                .setDescription('The name of the team to remove the roster')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('old_player')
                .setDescription('The name of the player being removed from the team')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('new_player')
                .setDescription('The name of the player being added to the team')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.name === "GoldyRL Master" || role.name === "Operations")) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#7A0019')
                .setTitle('GoldyRL - Permission Denied')
                .setDescription(`You don't have permission to execute /rostersub.\nOnly GoldyRL, Operations, and Admin users can execute this command.`);
            await interaction.reply( {embeds: [noPermissionEmbed]} );
            return;
        }

        await RosterData.sync();
        const teamName = interaction.options.getString('team_name');
        const oldPlayer = interaction.options.getString('old_player');
        const newPlayer = interaction.options.getString('new_player');

        // Check each column as we don't know if/where the old player is
        const p1Changes = await RosterData.update({ player_one: newPlayer }, { where: Sequelize.and({team_name: teamName}, {player_one: oldPlayer})});
        const p2Changes = await RosterData.update({ player_two: newPlayer }, { where: Sequelize.and({team_name: teamName}, {player_two: oldPlayer})});
        const p3Changes = await RosterData.update({ player_three: newPlayer }, { where: Sequelize.and({team_name: teamName}, {player_three: oldPlayer})});
        const p4Changes = await RosterData.update({ player_four: newPlayer }, { where: Sequelize.and({team_name: teamName}, {player_four: oldPlayer})});
        const p5Changes = await RosterData.update({ player_five: newPlayer }, { where: Sequelize.and({team_name: teamName}, {player_five: oldPlayer})});
        const p6Changes = await RosterData.update({ player_six: newPlayer }, { where: Sequelize.and({team_name: teamName}, {player_six: oldPlayer})});

        // Check to see if we actually changed an entry
        if (p1Changes == 0 && p2Changes == 0 && p3Changes == 0 && p4Changes == 0 && p5Changes == 0 && p6Changes == 0) {
            // We did not update any entries
            const noUpdateEmbed = new EmbedBuilder()
                .setTitle('GoldyRL - No Rosters Updated')
                .setDescription(`No rosters were updated for ${teamName} by subbing ${newPlayer} in for ${oldPlayer}. Please check to make sure you passed in the correct information.`)
                .setColor("#7A0019")
            await interaction.reply({ embeds: [noUpdateEmbed] });
        }
        else {
            // We did update AT LEAST 1 entry
            const embed = new EmbedBuilder()
                .setTitle('GoldyRL - Roster Updated')
                .setDescription(`The roster for ${teamName} was successfully updated by subbing ${newPlayer} in for ${oldPlayer}`)
                .setColor("#32CD32")
            await interaction.reply({ embeds: [embed] });
        }
    }
}