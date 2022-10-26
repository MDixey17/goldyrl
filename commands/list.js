const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('To be added'),
    async execute(interaction) {
        await interaction.reply(`To be added`);
    }
};