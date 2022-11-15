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
        .setName('addalias')
        .setDescription('Add a known alias or alternative name to a roster')
        .addStringOption(option => 
            option.setName('team_name')
                .setDescription('The team name as it exists in the database')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('alias')
                .setDescription('The alias or alternative name for the provided team')
                .setRequired(true)
        ),
    async execute(interaction) {
        RosterData.sync();
        const teamName = interaction.options.getString('team_name');
        const alias = interaction.options.getString('alias');
        const rosterInfo = await RosterData.findOne({where: {team_name: teamName}});
        if (rosterInfo) {
            // The roster exists in our database
            let currAliases = rosterInfo.get('aliases');
            // Check to make sure the alias doesn't already exist and we aren't acting on a null value
            if (currAliases === 'null' || currAliases === null) {
                currAliases = alias + ',';
            } else if (!currAliases.includes(alias)) {
                currAliases += alias + ",";
            } else {
                // Reaching this implies the current alias list is NOT null AND contains the provided alias
                const embed = new EmbedBuilder()
                    .setTitle(`GoldyRL - ${alias} Already Exists`)
                    .setColor("#FFFF00")
                    .setDescription(`The alias/alternate name ${alias} already exists for ${teamName}`);
                await interaction.reply({ embeds: [embed] });
                return;
            }

            // Update database
            const affectedRows = await RosterData.update({ aliases: currAliases }, { where: {team_name: teamName} });

            // Send message to user
            const embed = new EmbedBuilder()
                .setTitle(`GoldyRL - ${teamName}'s Alternate Names`)
                .setColor("#32CD32")
                .setDescription(`Successfully added the alias/alternate name ${alias} for ${teamName}`);
            await interaction.reply({ embeds: [embed] });
        }
        else {
            // Reaching here means the teamName doesn't exist in our records
            const embed = new EmbedBuilder()
                .setTitle(`GoldyRL - Cannot find ${teamName}`)
                .setDescription(`${teamName} does NOT exist in the roster database. Please use the /addroster command to add the team to the database.`)
                .setColor("#7A0019");
            await interaction.reply({ embeds: [embed] });
        }
    }
}