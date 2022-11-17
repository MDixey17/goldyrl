const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const startgg = require('smashgg.js');
const { Sequelize } = require('sequelize');
const _RosterData = require('../models/RosterData');
require('dotenv').config();

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const startggURL = 'https://api.start.gg/gql/alpha';

// Connect to the database
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'rosters.sqlite',
});

const RosterData = sequelize.define('roster_data', _RosterData);

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
        .setName('checkregistration')
        .setDescription('Check if a team is registered for a start.gg tournament')
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
                .setDescription('The team name to be checked')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        await RosterData.sync();
        const tourneyName = interaction.options.getString('tourney_slug');
        const eventName = interaction.options.getString('event_slug');
        const teamName = interaction.options.getString('team_name');
        const rosterInfo = await RosterData.findOne({where: {team_name: teamName}});
        let teamAliases = [];
        if (rosterInfo) {
            if (rosterInfo.get('aliases')) {
                teamAliases = rosterInfo.get('aliases').split(',');
            }
        }

        // Find tournament using smashgg.js
        let tourney = await Event.get(tourneyName, eventName);
        const tourneyID = tourney.getId();

        // Define loop variables
        let numRosters = 0;
        let numRostersFound = 0;
        let pageNumber = 1;
        let rateLimitCounter = 0;
        let foundTeam = false;

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
            numRosters = data.data.event.entrants.pageInfo.total;
        });

        // Pause the bot for 1 second
        sleep(1000);

        // Query the database and get 25 rosters at a time
        while (numRostersFound < numRosters && !foundTeam) {
            await fetch(startggURL, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: 'Bearer ' + process.env.START_GG_TOKEN
                },
                body: JSON.stringify({
                    query: "query EventEntrants($eventId: ID!, $page: Int!, $perPage: Int!) {event(id: $eventId) {id name entrants(query: {page: $page perPage: $perPage}) {pageInfo {total totalPages} nodes {name participants {gamerTag}}}}}",
                    variables: {
                        eventId: tourneyID,
                        page: pageNumber,
                        perPage: 25
                    },
                })
            }).then(r => r.json())
            .then(data => {
                let loopCondition = 25; // General case
                if (numRostersFound + loopCondition > numRosters) {
                    /*
                        Example case:
                        CCA Open 2022-23 West Fall Open 1 had 211 MATCHES
                        numMatchesFound = 200
                        We need the loop condition to be 211 - 200 = 11
                    */
                   loopCondition = numRosters - numRostersFound;
                }

                for (let i = 0; i < loopCondition; i++) {
                    let retTeamName = data.data.event.entrants.nodes[i].name;
                    if (retTeamName === teamName) {
                        foundTeam = true;
                        break;
                    }
                    else {
                        // Check aliases
                        for (let j = 0; j < teamAliases.length; j++) {
                            if (retTeamName === teamAliases[j]) {
                                foundTeam = true;
                                break;
                            }
                        }
                        if (foundTeam) {
                            break;
                        }
                    }
                }
            })

            // Increment the loop variables
            pageNumber += 1;
            numRostersFound += 25;

            // Pause the bot
            sleep(1000);
        }

        //console.log("Rate Limit Counter: ", rateLimitCounter);
        if (foundTeam) {
            // The team is registered
            // Send success message
            const embed = new EmbedBuilder()
                .setColor('#32CD32')
                .setTitle(`GoldyRL - Registration Status for ${teamName}`)
                .setDescription(`${teamName} is registered for the ${tourney.getName()} event`);
            
            await interaction.editReply( { embeds: [embed] } );
        }
        else {
            // The team is NOT registered
            const embed = new EmbedBuilder()
                .setColor('#7A0019')
                .setTitle(`GoldyRL - Registration Status for ${teamName}`)
                .setDescription(`${teamName} is NOT registered for the ${tourney.getName()} event`);
            
            await interaction.editReply( { embeds: [embed] } );
        }
    }
}