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
        .setName('checkplayer')
        .setDescription('Check if a player is on a roster in the database')
        .addStringOption(option => 
            option.setName('player_name')
                .setDescription(`The player's gamertag`)
                .setRequired(true)
        ),
    async execute(interaction) {
        await RosterData.sync();
        const playerName = interaction.options.getString('player_name');
        let desc = `Rosters associated with ${playerName}\n\n`;
        let foundFlag = false;
        const embed = new EmbedBuilder()
            .setTitle(`GoldyRL - ${playerName}'s Rosters`)
            .setColor('#32CD32');

        let p = await RosterData.findAll({where: {player_one: playerName}});
        for (let i = 0; i < p.length; i++) {
            desc += p[0].team_name + "\n";
            foundFlag = true;
        }

        p = await RosterData.findAll({where: {player_two: playerName}});
        for (let i = 0; i < p.length; i++) {
            desc += p[0].team_name + "\n";
            foundFlag = true;
        }

        p = await RosterData.findAll({where: {player_three: playerName}});
        for (let i = 0; i < p.length; i++) {
            desc += p[0].team_name + "\n";
            foundFlag = true;
        }

        p = await RosterData.findAll({where: {player_four: playerName}});
        for (let i = 0; i < p.length; i++) {
            desc += p[0].team_name + "\n";
            foundFlag = true;
        }

        p = await RosterData.findAll({where: {player_five: playerName}});
        for (let i = 0; i < p.length; i++) {
            desc += p[0].team_name + "\n";
            foundFlag = true;
        }

        p = await RosterData.findAll({where: {player_six: playerName}});
        for (let i = 0; i < p.length; i++) {
            desc += p[0].team_name + "\n";
            foundFlag = true;
        }

        if (foundFlag) {
            embed.setDescription(desc);
        }
        else {
            embed.setTitle(`GoldyRL - No Rosters for ${playerName}`)
                .setColor('#7A0019')
                .setDescription(`No teams contain the player ${playerName}`);
        }

        await interaction.reply({ embeds: [embed] });
    }
}
