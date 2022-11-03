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
                .setDescription('Name of the tournament as one word, ALL LOWERCASE, with _ instead of spaces')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('event_slug')
                .setDescription('Name of the event as one word, ALL LOWERCASE, with _ instead of spaces')
                .setRequired(true)
        ),
    async execute(interaction) {
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
            .setTitle('GoldyRL - Added Match')
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

        sleep(10000);

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
                    query: "query set($setId: ID!) {set(id: $setId) {slots {standing {placement stats { score {value}}}}}}",
                    variables: {
                        setId: setIDs[i]
                    },
                })
            }).then(r => r.json())
            .then(setData => {
                //console.log(setData.data.set.slots[0].standing);
                let teamOneScore = setData.data.set.slots[0].standing.stats.score.value;
                let teamTwoScore = setData.data.set.slots[1].standing.stats.score.value;

                matchResults.push(String(teamOneList[i]) + ' ' + String(teamOneScore) + ' - ' + String(teamTwoScore) + ' ' + String(teamTwoList[i]));
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
        for (let i = 0; i < matchResults.length; i++) {
            console.log(matchResults[i]);
        }
        await interaction.editReply( { embeds: [embed] } );
    }
};