const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('To be added'),
    async execute(interaction) {
        await interaction.reply(`To be added`);
    }
};