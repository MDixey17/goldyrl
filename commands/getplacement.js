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

function sleep(ms) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < ms);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getplacement')
        .setDescription('Get final placement in a tournament')
        .addStringOption(option => 
            option.setName('tourney_slug')
                .setDescription('Tournament Slug according to start.gg URL')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('event_slug')
                .setDescription('Event Slug according to start.gg URL')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('team_name')
                .setDescription('Name of team from the tournament')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const tourneyName = interaction.options.getString('tourney_slug');
        const eventName = interaction.options.getString('event_slug');
        const teamName = interaction.options.getString('team_name');

        // Find tournament using smashgg.js
        let tourney = await Event.get(tourneyName, eventName);
        const tourneyID = tourney.getId();

        if (tourney.getState() != 'COMPLETED') {
            const incompleteEmbed = new EmbedBuilder()
                .setColor('#7A0019')
                .setTitle('GoldyRL - Tournament In Progress')
                .setDescription('The tournament is not completed and final placement data cannot be found at this time');
            await interaction.reply( { embeds: [incompleteEmbed] } );
            return
        }

        let placement = -1;
        let numTeams = 0;
        let numTeamsFound = 0;
        let numTeamsSharedPlacement = 0;
        let placementFound = false;
        let pageNumber = 1;
        let rateLimitCounter = 0;

        // Get number of entrants
        await fetch(startggURL, {
            method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: 'Bearer ' + process.env.START_GG_TOKEN
                },
                body: JSON.stringify({
                    query: "query EventEntrants($eventId: ID!, $page: Int!, $perPage: Int!) {event(id: $eventId) {id name entrants(query: {page: $page perPage: $perPage}) {pageInfo {total totalPages}}}}",
                    variables: {
                        eventId: tourneyID,
                        page: 1,
                        perPage: 1
                    },
            })
        }).then(r => r.json())
        .then(data => {
            numTeams = data.data.event.entrants.pageInfo.total;
        });

        // Pause the bot for 1 second
        sleep(1000);

        // Find the team's placement, return "Not Found" embed if it doesn't exist
        while (numTeamsFound < numTeams && placement == -1) {
            await fetch(startggURL, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: 'Bearer ' + process.env.START_GG_TOKEN
                },
                body: JSON.stringify({
                    query: "query EventStandings($eventId: ID!, $page: Int!, $perPage: Int!) {event(id: $eventId) {id name standings(query: {perPage: $perPage, page: $page}){nodes {placement entrant {id name}}}}}",
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
                if (numTeamsFound + loopCondition > numTeams) {
                    /*
                        Example case:
                        CCA Open 2022-23 West Fall Open 1 had 211 MATCHES
                        numMatchesFound = 200
                        We need the loop condition to be 211 - 200 = 11
                    */
                   loopCondition = numTeams - numTeamsFound;
                }

                // Iterate through data obtained
                for (let i = 0; i < loopCondition; i++) {
                    if (teamName === data.data.event.standings.nodes[i].entrant.name) {
                        placement = data.data.event.standings.nodes[i].placement;
                        placementFound = true;
                    }
                }

                if (placementFound) {
                    // Find the number of teams that share the same placement in the data set obtained
                    // NOTE: this won't be perfect, but it'll give a good range
                    for (let i = 0; i < loopCondition; i++) {
                        if (placement == data.data.event.standings.nodes[i].placement) {
                            numTeamsSharedPlacement += 1;
                        }
                    }
                }
            }).catch(err => {
                if (err instanceof TypeError) {
                    console.log(err);
                    rateLimitCounter += 1;
                } else {
                    console.log(err);
                }
            })

            // Increment loop variables
            pageNumber += 1;
            numTeamsFound += 50;
            // Pause the bot for 1 second
            sleep(1000);
        }

        //console.log(matchResults);
        console.log("Rate Limit Counter: ", rateLimitCounter);
        if (placement == -1) {
            // Team was not found in the tournament
            const notFoundEmbed = new EmbedBuilder()
                .setColor("#7A0019")
                .setTitle('GoldyRL - Team Placement Not Found')
                .setDescription(`Unable to find ${teamName}'s placement in ${tourney.getName()}`);
            
            await interaction.editReply( { embeds: [notFoundEmbed] } );
        }
        else {
            // Team was found in the tournament placements
            const embed = new EmbedBuilder()
                .setColor('#32CD32')
                .setTitle('GoldyRL - Found Team Placement')
            if (numTeamsSharedPlacement > 0) {
                embed.setDescription(`Successfully found ${teamName}'s placement in ${tourney.getName()}\n${placement}-${placement + numTeamsSharedPlacement} out of ${numTeams}`);
            }
            else {
                embed.setDescription(`Successfully found ${teamName}'s placement in ${tourney.getName()}\n${placement} out of ${numTeams}`);
            }
                
            await interaction.editReply( { embeds: [embed] } );
        }
    }
}