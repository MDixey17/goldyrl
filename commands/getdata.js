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
        .setName('getdata')
        .setDescription('Fetch data for a specific team')
        .addStringOption(option => 
            option.setName('team_name')
                .setDescription('Desired team for data retrieval')
                .setRequired(true)
        ),
    async execute(interaction) {
        await MatchData.sync();
        const team_name = interaction.options.getString("team_name");
        const embed = new EmbedBuilder()
            .setTitle(`GoldyRL - Retrieved Data for ${team_name}`)
            .setDescription(`Data for ${team_name}`)
            .setColor('#32CD32');
        const teamInfo1 = await MatchData.findAll({where: {team_one: team_name}});
        const teamInfo2 = await MatchData.findAll({where: {team_two: team_name}});
        let embedDescription = `Data for ${team_name}\n\n`;
        let maxDescFlag = false;
        for(let i = 0; i < teamInfo1.length; i++) {
            let name = teamInfo1[i].team_one + ' ' + teamInfo1[i].team_one_score + ' - ' + teamInfo1[i].team_two_score + ' ' + teamInfo1[i].team_two;
            let value = teamInfo1[i].date + ' ' + teamInfo1[i].league;
            if (embedDescription.length + name.length + value.length + 6 < 4095) {
                embedDescription += name + "\n" + value + "\n\n";
            }
            else {
                maxDescFlag = true;
            }
        };
        for(let i = 0; i < teamInfo2.length; i++) {
            let name = teamInfo2[i].team_one + ' ' + teamInfo2[i].team_one_score + ' - ' + teamInfo2[i].team_two_score + ' ' + teamInfo2[i].team_two;
            let value = teamInfo2[i].date + ' ' + teamInfo2[i].league;
            if (embedDescription.length + name.length + value.length + 6 < 4095) {
                embedDescription += name + "\n" + value + "\n\n";
            }
            else {
                maxDescFlag = true;
            }
        };
        embed.setDescription(embedDescription);
        if (maxDescFlag) {
            embed.setFooter("And more....");
        }
        await interaction.reply({ embeds: [embed] });
    }
};