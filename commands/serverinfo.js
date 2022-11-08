const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get server statistics'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(`GoldyRL - ${interaction.guild.name} Stats`)
            .setDescription(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`)
            .setColor("#32CD32");
        await interaction.reply({ embeds: [embed] });
    }
};