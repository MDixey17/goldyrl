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
        .setName('resetrosters')
        .setDescription('Reset the roster database'),
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.name === "Operations")) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#7A0019')
                .setTitle('GoldyRL - Permission Denied')
                .setDescription(`You don't have permission to execute /resetrosters.\nOnly Operations and Admin users can execute this command.`);
            await interaction.reply( {embeds: [noPermissionEmbed]} );
            return;
        }

        // Reset the roster database
        await RosterData.sync({ force: true });
        const embed = new EmbedBuilder()
            .setColor("#32CD32")
            .setTitle("GoldyRL - Reset Roster Database")
            .setDescription("Successfully reset the roster database");

        await interaction.reply({ embeds: [embed] });

    }
}