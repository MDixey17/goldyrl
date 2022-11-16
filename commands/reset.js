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
        .setName('reset')
        .setDescription('Reset the match history database'),
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.name === "Operations")) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#7A0019')
                .setTitle('GoldyRL - Permission Denied')
                .setDescription(`You don't have permission to execute /reset.\nOnly Operations and Admin users can execute this command.`);
            await interaction.reply( {embeds: [noPermissionEmbed]} );
            return;
        }

        // Reset the match history database
        await MatchData.sync({ force: true });
        const embed = new EmbedBuilder()
            .setColor("#32CD32")
            .setTitle("GoldyRL - Reset Match History Database")
            .setDescription("Successfully reset the match history database");

        await interaction.reply({ embeds: [embed] });
    }
};