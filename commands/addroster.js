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
        .setName('addroster')
        .setDescription('Manually add a roster to the database')
        .addStringOption(option =>
            option.setName('team_name')
                .setDescription('The team name for the roster')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('player_one')
                .setDescription('The captain of the team')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('player_two')
                .setDescription('The 2nd player of the team')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('player_three')
                .setDescription('The 3rd player of the team')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('player_four')
                .setDescription('The 4th player of the team')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('player_five')
                .setDescription('The 5th player of the team')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('player_six')
                .setDescription('The 6th player of the team')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('aliases')
                .setDescription('Alternate team names, separated by commas')
                .setRequired(false)
        ),
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.name === "GoldyRL Master" || role.name === "Operations")) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#7A0019')
                .setTitle('GoldyRL - Permission Denied')
                .setDescription(`You don't have permission to execute /addroster.\nOnly GoldyRL, Operations, and Admin users can execute this command.`);
            await interaction.reply( {embeds: [noPermissionEmbed]} );
            return;
        }
        await RosterData.sync();
        const teamName = interaction.options.getString('team_name');
        const p1 = interaction.options.getString('player_one');
        const p2 = interaction.options.getString('player_two');
        const p3 = interaction.options.getString('player_three');
        const p4 = interaction.options.getString('player_four') ?? "-";
        const p5 = interaction.options.getString('player_five') ?? "-";
        const p6 = interaction.options.getString('player_six') ?? "-";
        let aliases = interaction.options.getString('aliases') ?? '';

        if (!aliases.endsWith(',') && aliases.length > 0) {
            aliases += ',';
        }

        const dataEntry = await RosterData.create({
            team_name: teamName,
            player_one: p1,
            player_two: p2,
            player_three: p3,
            player_four: p4,
            player_five: p5,
            player_six: p6,
            aliases: aliases
        });

        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('GoldyRL - Added Roster')
            .setDescription(`Successfully added the roster for ${teamName}`);

        await interaction.reply({ embeds: [embed] });
    }
}