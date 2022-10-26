const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getdata')
        .setDescription('To be added'),
    async execute(interaction) {
        await interaction.reply(`To be added`);
    }
};