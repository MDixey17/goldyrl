const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmatch')
        .setDescription('Add a single match to the database'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
        .setColor('#32CD32')
        .setTitle('GoldyRL - Added Match')
        .setDescription('Successfully added the match information to the database')
        await interaction.reply({ embeds: [embed] });
    }
};