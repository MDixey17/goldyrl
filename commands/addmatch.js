const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addmatch')
        .setDescription('Add a single match to the database')
        .addStringOption(option => 
            option.setName('team_one')
                .setDescription('Team 1 in the completed match')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('team_one_score')
                .setDescription(`Team 1's score in the completed match`)
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('team_two')
                .setDescription('Team 2 in the completed match')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('team_two_score')
                .setDescription(`Team 2's score in the completed match`)
                .setRequired(true)
        ),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('GoldyRL - Added Match')
            .setDescription('Successfully added the match information to the database');
        
        const teamOne = interaction.options.getString('team_one');
        const teamOneScore = interaction.options.getInteger('team_one_score');
        const teamTwo = interaction.options.getString('team_two');
        const teamTwoScore = interaction.options.getInteger('team_two_score');
        await interaction.reply({ embeds: [embed] });
    }
};