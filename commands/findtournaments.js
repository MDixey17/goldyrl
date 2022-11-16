const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const startggURL = 'https://api.start.gg/gql/alpha';


module.exports = {
    data: new SlashCommandBuilder()
        .setName('findtournaments')
        .setDescription('Find up to 10 start.gg tournaments for a specific game title')
        .addIntegerOption(option =>
            option.setName('game_id')
                .setDescription('The video game ID according to start.gg (use /getgameids for help); Rocket League is default')
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const gameID = interaction.options.getInteger('game_id') ?? 14;
        let gameTitle = "";
        if (gameID === 14) {
            gameTitle = 'Rocket League';
        } else if (gameID === 10) {
            gameTitle = 'League of Legends';
        } else if (gameID === 31) {
            gameTitle = 'Overwatch';
        } else if (gameID === 5502) {
            gameTitle = 'Rainbow Six Siege';
        } else if (gameID === 11) {
            gameTitle = 'Dota 2';
        } else if (gameID === 12) {
            gameTitle = 'CS:GO';
        } else {
            gameTitle = 'Unknown Game Title'
        }
        
        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle(`GoldyRL - Found Upcoming ${gameTitle} Tournaments`)
            .setDescription(`Found the following ${gameTitle} tournaments that are upcoming`);

        await fetch(startggURL, {
            method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: 'Bearer ' + process.env.START_GG_TOKEN
                },
                body: JSON.stringify({
                    query: `query TournamentsByVideogame($perPage: Int!, $videogameId: ID!) {tournaments(query: {perPage: $perPage page: 1 sortBy: "startAt desc" filter: {past: false videogameIds: [$videogameId]}}) {nodes {id countryCode name numAttendees slug startAt}}}`,
                    variables: {
                        perPage: 10,
                        videogameId: gameID
                    }
                })
        }).then(r => r.json())
        .then(data => {
            let tourneys = [...new Set(data.data.tournaments.nodes)];
            let defaultResponse = 'Not Available';
            tourneys.forEach(t => {
                let d = new Date(t.startAt * 1000);
                var dd = String(d.getDate()).padStart(2, '0');
                var mm = String(d.getMonth() + 1).padStart(2, '0');
                var yyyy = String(d.getFullYear());
                const currentDay = mm + "-" + dd + "-" + yyyy;
                embed.addFields({
                    name: `${t.name}`,
                    value: `ID: ${t.id}\nCountry: ${t.countryCode ?? defaultResponse}\nNumber of Attendees: ${t.numAttendees ?? defaultResponse}\nURL: start.gg/${t.slug}\nStart Date: ${currentDay}`,
                    inline: false
                });
            });
        })
        .catch(err => {
            console.log(err);
        });
        
        await interaction.editReply( { embeds: [embed] } );
    }
}