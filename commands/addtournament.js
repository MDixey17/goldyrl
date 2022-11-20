const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Sequelize } = require('sequelize');
const _MatchData = require('../models/MatchData');
const startgg = require('smashgg.js');
require('dotenv').config();

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const startggURL = 'https://api.start.gg/gql/alpha';

// Log into the start.gg API
startgg.initialize(process.env.START_GG_TOKEN);

const Event = startgg.Event;

// Connect to the database
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'matchdata.sqlite',
});

const MatchData = sequelize.define('match_data', _MatchData);

function sleep(ms) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < ms);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addtournament')
        .setDescription('Add tournament matches to the database')
        .addStringOption(option => 
            option.setName('tourney_slug')
                .setDescription('Tournament Slug according to start.gg URL')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('event_slug')
                .setDescription('Event Slug according to start.gg URL')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.name === "GoldyRL Master" || role.name === "Operations")) {
            const noPermissionEmbed = new EmbedBuilder()
                .setColor('#7A0019')
                .setTitle('GoldyRL - Permission Denied')
                .setDescription(`You don't have permission to execute /addtournament.\nOnly GoldyRL, Operations, and Admin users can execute this command.`);
            await interaction.reply( {embeds: [noPermissionEmbed]} );
            return;
        }
        await MatchData.sync();
        await interaction.deferReply();
        const tourneyName = interaction.options.getString('tourney_slug');
        const eventName = interaction.options.getString('event_slug');

        // Find the tournament using smashgg.js
        let tourney = await Event.get(tourneyName, eventName);
        const tourneyID = tourney.getId();

        if (tourney.getState() != 'COMPLETED') {
            const incompleteEmbed = new EmbedBuilder()
                .setColor('#7A0019')
                .setTitle('GoldyRL - Tournament In Progress')
                .setDescription('The tournament is not completed and match data cannot be added at this time');
            await interaction.reply( { embeds: [incompleteEmbed] } );
            return
        }

        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('GoldyRL - Added Tournament')
            .setDescription(`Successfully added the tournament information to the database for ${tourney.getName()}`);
        
        // Get the matches
        let matchResults = [];
        let teamOneList = [];
        let teamTwoList = [];
        let setIDs = [];
        let numTourneyMatches = 0;
        let numMatchesFound = 0;
        let pageNumber = 1;
        let rateLimitCounter = 0;

        // Get the number of matches
        await fetch(startggURL, {
            method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: 'Bearer ' + process.env.START_GG_TOKEN
                },
                body: JSON.stringify({
                    query: "query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) { event(id: $eventId) {sets(page: $page perPage: $perPage sortType: STANDARD) {pageInfo {total} nodes {id slots {entrant {name}}}}}}",
                    variables: {
                        eventId: tourneyID,
                        page: 1,
                        perPage: 1
                    },
            })
        }).then(r => r.json())
        .then(data => {
            numTourneyMatches = data.data.event.sets.pageInfo.total;
        });

        // Pause the bot for 1 second
        sleep(1000);

        // Use while loop to go through matches, getting 50 at a time
        while (numMatchesFound < numTourneyMatches) {
            await fetch(startggURL, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: 'Bearer ' + process.env.START_GG_TOKEN
                },
                body: JSON.stringify({
                    query: "query EventSets($eventId: ID!, $page: Int!, $perPage: Int!) { event(id: $eventId) {sets(page: $page perPage: $perPage sortType: STANDARD) {pageInfo {total} nodes {id slots {entrant {name}}}}}}",
                    variables: {
                        eventId: tourneyID,
                        page: pageNumber,
                        perPage: 50
                    },
                })
            }).then(r => r.json())
            .then(data => {
                // EDGE CASE: Make sure we don't go out of bounds
                let loopCondition = 50; // General case
                if (numMatchesFound + loopCondition > numTourneyMatches) {
                    /*
                        Example case:
                        CCA Open 2022-23 West Fall Open 1 had 211 MATCHES
                        numMatchesFound = 200
                        We need the loop condition to be 211 - 200 = 11
                    */
                   loopCondition = numTourneyMatches - numMatchesFound;
                }

                // Iterate through data obtained
                for (let i = 0; i < loopCondition; i++) {
                    teamOneList.push(data.data.event.sets.nodes[i].slots[0].entrant.name);
                    teamTwoList.push(data.data.event.sets.nodes[i].slots[1].entrant.name);
                    setIDs.push(data.data.event.sets.nodes[i].id);
                }
            }).catch(err => {
                if (err instanceof TypeError) {
                    console.log("Rate Limit in EventSets");
                    rateLimitCounter += 1;
                } else {
                    console.log(err);
                }
            })

            // Increment loop variables
            pageNumber += 1;
            numMatchesFound += 50;
            // Pause the bot for 1 second
            sleep(1000);
        }

        sleep(1000);

        // Get the scores of the matches using the setIDs
        for (let i = 0; i < setIDs.length; i++) {
            // Pause the bot for 1 second
            sleep(1000);
            await fetch(startggURL, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: 'Bearer ' + process.env.START_GG_TOKEN
                },
                body: JSON.stringify({
                    query: "query set($setId: ID!) {set(id: $setId) {startedAt slots {standing {placement stats { score {value}}}}}}",
                    variables: {
                        setId: setIDs[i]
                    },
                })
            }).then(r => r.json())
            .then(setData => {
                //console.log(setData.data.set.slots[0].standing);
                let teamOneScore = setData.data.set.slots[0].standing.stats.score.value;
                let teamTwoScore = setData.data.set.slots[1].standing.stats.score.value;
                let d = new Date(setData.data.set.startedAt * 1000);
                var dd = String(d.getDate()).padStart(2, '0');
                var mm = String(d.getMonth() + 1).padStart(2, '0');
                var yyyy = String(d.getFullYear());
                const currentDay = mm + "-" + dd + "-" + yyyy;

                // EDGE CASE: Check for DQ's --> indicated by -1 for team score
                if (!(teamOneScore === -1 || teamTwoScore === -1)) {
                    //matchResults.push(String(teamOneList[i]) + ' ' + String(teamOneScore) + ' - ' + String(teamTwoScore) + ' ' + String(teamTwoList[i]));
                    const dataEntry = MatchData.create({
                        team_one: teamOneList[i],
                        team_one_score: teamOneScore,
                        team_two: teamTwoList[i],
                        team_two_score: teamTwoScore,
                        date: currentDay,
                        league: tourney.getName()
                    });

                }
            }).catch(err => {
                if (err instanceof TypeError) {
                    console.log("Rate Limit in Set");
                    rateLimitCounter += 1;
                } else {
                    console.log(err);
                }    
            });
        }

        //console.log(matchResults);
        console.log("Rate Limit Counter: ", rateLimitCounter);
        
        // Print the match results
        /* for (let i = 0; i < matchResults.length; i++) {
            console.log(matchResults[i]);
        } */
        await fetch(startggURL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Accept': 'application/json',
                Authorization: 'Bearer ' + process.env.START_GG_TOKEN
            },
            body: JSON.stringify({
                query: "query TournamentQuery($slug: String) {tournament(slug: $slug){id name images {url}}}",
                variables: {
                    slug: tourneyName
                },
            })
        }).then(r => r.json())
        .then(data => {
            if (data.data.tournament.images[0].url) {
                embed.setThumbnail(data.data.tournament.images[0].url);
            }
        }).catch(err => {
            console.log(err);
        })
        
        await interaction.editReply( { embeds: [embed] } );
    }
};