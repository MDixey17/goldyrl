const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Sequelize } = require('sequelize');
const _RosterData = require('../models/RosterData');
const startgg = require('smashgg.js');
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
        .setName('gettourneyrosters')
        .setDescription('Get the rosters from a specified tournament')
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
                .setDescription(`You don't have permission to execute /gettourneyrosters.\nOnly GoldyRL, Operations, and Admin users can execute this command.`);
            await interaction.reply( {embeds: [noPermissionEmbed]} );
            return;
        }

        await interaction.deferReply();
        await RosterData.sync();
        const tourneyName = interaction.options.getString('tourney_slug');
        const eventName = interaction.options.getString('event_slug');

        // Find tournament using smashgg.js
        let tourney = await Event.get(tourneyName, eventName);
        const tourneyID = tourney.getId();

        // Define loop variables
        let numRosters = 0;
        let numRostersFound = 0;
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
            numRosters = data.data.event.entrants.pageInfo.total;
        });

        // Pause the bot for 1 second
        sleep(1000);

        // Query the database and get 25 rosters at a time
        while (numRostersFound < numRosters) {
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
                    let teamName = data.data.event.entrants.nodes[i].name;
                    let rosterNames = [...new Set(data.data.event.entrants.nodes[i].participants)];
                    let playerNumber = 1;
                    let p1 = '-';
                    let p2 = '-';
                    let p3 = '-';
                    let p4 = '-';
                    let p5 = '-';
                    let p6 = '-';

                    // Go through the players
                    rosterNames.forEach(player => {
                        // Find out where we are with playerNumber so each name can be added properly
                        if (playerNumber == 1) {
                            p1 = player.gamerTag;
                        } else if (playerNumber == 2) {
                            p2 = player.gamerTag;
                        } else if (playerNumber == 3) {
                            p3 = player.gamerTag;
                        } else if (playerNumber == 4) {
                            p4 = player.gamerTag;
                        } else if (playerNumber == 5) {
                            p5 = player.gamerTag;
                        } else if (playerNumber == 6) {
                            p6 = player.gamerTag;
                        }
                        playerNumber += 1;
                    });

                    try {
                        const dataEntry = RosterData.create({
                            team_name: teamName,
                            player_one: p1,
                            player_two: p2,
                            player_three: p3,
                            player_four: p4,
                            player_five: p5,
                            player_six: p6
                        });
                    }
                    catch (err) {
                        if (err.name === 'SequelizeUniqueConstraintError') { 
                            console.log('Found a duplicate team name! Ignoring')
                        }
                        else if (err instanceof TypeError) {
                            console.log(err);
                            rateLimitCounter += 1;
                        }
                        else {
                            console.log(err);
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

        console.log("Rate Limit Counter: ", rateLimitCounter);

        // Send success message
        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('GoldyRL - Added Rosters From Tournament')
            .setDescription(`Successfully added the rosters to the database from ${tourney.getName()}`);
        
        await interaction.editReply( { embeds: [embed] } );
    }
}