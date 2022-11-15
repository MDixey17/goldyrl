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
        .setName('getroster')
        .setDescription('Get the roster for a specified team')
        .addStringOption(option => 
            option.setName('team_name')
                .setDescription('Desired team for data retrieval')
                .setRequired(true)
        ),
    async execute(interaction) {
        await RosterData.sync();
        const teamName = interaction.options.getString("team_name");
        const rosterInfo = await RosterData.findOne({where: {team_name: teamName}});

        let descString = `The stored roster for ${teamName}:\n`;
        const embed = new EmbedBuilder()
            .setTitle(`GoldyRL - ${teamName}'s roster`)
            .setColor("#32CD32");

        if (rosterInfo) {
            if (rosterInfo.get('player_one') !== '-') {
                descString += rosterInfo.get('player_one') + "\n";
            }
            if (rosterInfo.get('player_two') !== '-') {
                descString += rosterInfo.get('player_two') + "\n";
            }
            if (rosterInfo.get('player_three') !== '-') {
                descString += rosterInfo.get('player_three') + "\n";
            }
            if (rosterInfo.get('player_four') !== '-') {
                descString += rosterInfo.get('player_four') + "\n";
            }
            if (rosterInfo.get('player_five') !== '-') {
                descString += rosterInfo.get('player_five') + "\n";
            }
            if (rosterInfo.get('player_six') !== '-') {
                descString += rosterInfo.get('player_six') + "\n";
            }
            // Added info about the known aliases for the team
            let tAlias = rosterInfo.get('aliases');
            tAlias = tAlias.split(',');
            if (tAlias.length === 0) {
                descString += "\nThere are no known aliases or alternate names for this team";
            }
            else {
                descString += "\nAliases & Alternate Names\n"
            }
            for (let i = 0; i < tAlias.length; i++) {
                descString += String(tAlias[i]) + "\n";
            }
            embed.setDescription(descString);
            await interaction.reply({ embeds: [embed] });
        }
        else {
            // Check the aliases
            /*
             We need to look at every team until either (1) we find a match with the alias and teamName
             or (2) we go through the entire database without a match
            */
            const aliasList = await RosterData.findAll({ attributes: ['team_name', 'aliases'] });
            let aliasFound = false;
            let storedName = '';
            aliasList.forEach(async teamAlias => {
                // Make sure the team we have actually has an alias AND we haven't already found the team
                if (teamAlias.aliases && !aliasFound) {
                    // Split on the comma
                    const a = teamAlias.aliases.split(',');
                    for (let i = 0; i < a.length; i++) {
                        if (a[i] === teamName) {
                            // We found the team under a different name, now get the original name
                            storedName = teamAlias.team_name;
                            aliasFound = true;
                            break;
                        }
                    }
                }
            });
            if (aliasFound) {
                // Get the roster data under the original name
                const rosterInfo = await RosterData.findOne({where: {team_name: storedName}});
                if (rosterInfo.get('player_one') !== '-') {
                    descString += rosterInfo.get('player_one') + "\n";
                }
                if (rosterInfo.get('player_two') !== '-') {
                    descString += rosterInfo.get('player_two') + "\n";
                }
                if (rosterInfo.get('player_three') !== '-') {
                    descString += rosterInfo.get('player_three') + "\n";
                }
                if (rosterInfo.get('player_four') !== '-') {
                    descString += rosterInfo.get('player_four') + "\n";
                }
                if (rosterInfo.get('player_five') !== '-') {
                    descString += rosterInfo.get('player_five') + "\n";
                }
                if (rosterInfo.get('player_six') !== '-') {
                    descString += rosterInfo.get('player_six') + "\n";
                }

                // Added info about the known aliases for the team
                let tAlias = rosterInfo.get('aliases');
                tA = tAlias.split(',');
                descString += "\nAliases & Alternate Names\n"
                for (let i = 0; i < tA.length; i++) {
                    if (String(tA[i]) !== teamName) {
                        descString += String(tA[i]) + "\n";
                    }
                    else {
                        descString += storedName + "\n";
                    }
                }
                embed.setDescription(descString);
                await interaction.reply({ embeds: [embed] });
            }
            else {
                // No alias found, team does NOT exist in our records
                const embed = new EmbedBuilder()
                    .setTitle(`GoldyRL - Cannot find ${teamName}'s roster`)
                    .setDescription('Roster does not exist in the database')
                    .setColor("#7A0019");
                await interaction.reply({ embeds: [embed] });
            }
        }
    }

}