const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get a list of commands for GoldyRL'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(`GoldyRL - List of Commands`)
            .setDescription(`A list of current commands that GoldyRL responds to. Commands that require certain permissions are marked with an asterisk (*)`)
            .setColor("#32CD32")
            .addFields({
                name: '* /addalias',
                value: 'Add an alternate team name to a roster stored in the database',
                inline: false,
            })
            .addFields({
                name: '* /addmatch',
                value: 'Manually add a match to the match history database',
                inline: false,
            })
            .addFields({
                name: '* /addtournament',
                value: 'Obtain all matches from a start.gg tournament and store it in the match history database. Takes several minutes to execute!',
                inline: false,
            })
            .addFields({
                name: '/checkplayer',
                value: 'Check if a player belongs to a roster in the database',
                inline: false,
            })
            .addFields({
                name: '/checkregistration',
                value: 'Check if a team is registered for a start.gg tournament',
                inline: false,
            })
            .addFields({
                name: '/checkteam',
                value: 'Check if a team has any match history stored in the database',
                inline: false,
            })
            .addFields({
                name: '** /deletelast',
                value: 'Delete the last stored match for a specified team',
                inline: false,
            })
            .addFields({
                name: '** /deleteroster',
                value: 'Delete a roster from the roster database',
                inline: false,
            })
            .addFields({
                name: '/findtournaments',
                value: 'Find up to 10 start.gg tournaments for a specific game title',
                inline: false,
            })
            .addFields({
                name: '/getdata',
                value: 'Get the match history for a specific team',
                inline: false,
            })
            .addFields({
                name: '/getgameids',
                value: 'Helper command to /findtournaments. Gives a list of popular game titles and their start.gg game ID',
                inline: false,
            })
            .addFields({
                name: '/getplacement',
                value: "Get a team's placement in a start.gg tournament",
                inline: false,
            })
            .addFields({
                name: '/getroster',
                value: 'Get the roster for a specified team name',
                inline: false,
            })
            .addFields({
                name: '/gettournamentinfo',
                value: 'Get basic information about a start.gg tournament',
                inline: false,
            })
            .addFields({
                name: '* /gettourneyrosters',
                value: 'Add all rosters from a start.gg tournament to the database',
                inline: false,
            })
            .addFields({
                name: '/list',
                value: 'List all team names that have at least one match stored in the database',
                inline: false,
            })
            .addFields({
                name: '/listrosters',
                value: 'List all the team names that have a roster stored in the database',
                inline: false,
            })
            .addFields({
                name: '/matchup',
                value: 'Get the rosters and match history between two teams',
                inline: false,
            })
            .addFields({
                name: '** /reset',
                value: 'Reset the match history database',
                inline: false,
            })
            .addFields({
                name: '** /resetrosters',
                value: 'Reset the roster database',
                inline: false,
            })
            .addFields({
                name: '* /rostersub',
                value: 'Substitue a player for a specified team',
                inline: false,
            });
        await interaction.reply({ embeds: [embed] });
    }
};