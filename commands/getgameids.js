const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getgameids')
        .setDescription('Obtain the Game IDs for start.gg tournaments'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(`GoldyRL - start.gg Game IDs`)
            .setDescription(`Below is a list of common Game IDs with start.gg\n\nID #10 = League of Legends\nID #11 = Dota 2\nID #12 = CS:GO\nID #14 = Rocket League\nID #31 = Overwatch\nID #5502 = Rainbow Six Siege\n\nClick the title of the message to view all known Game IDs`)
            .setColor("#32CD32")
            .setURL('https://docs.google.com/spreadsheets/d/1l-mcho90yDq4TWD-Y9A22oqFXGo8-gBDJP0eTmRpTaQ/edit#gid=1924677423');
        await interaction.reply({ embeds: [embed] });
    }
};