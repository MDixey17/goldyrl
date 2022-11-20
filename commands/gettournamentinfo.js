const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
        .setName('gettournamentinfo')
        .setDescription('Obtain basic information about a start.gg tournament')
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
        await interaction.deferReply();
        const tourneyName = interaction.options.getString('tourney_slug');
        const eventName = interaction.options.getString('event_slug');

        // Find the tournament using smashgg.js
        let tourney = await Event.get(tourneyName, eventName);
        let d = new Date(tourney.startAt * 1000);
        var dd = String(d.getDate()).padStart(2, '0');
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var yyyy = String(d.getFullYear());
        const currentDay = mm + "-" + dd + "-" + yyyy;

        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('GoldyRL - Found Tournament Info')
            .setDescription(`Retrieved the following tournament information:`)
            .addFields({
                name: 'Tournament Name',
                value: `${tourney.getName()}`,
                inline: false,
            })
            .addFields({
                name: 'Tournament ID',
                value: `${tourney.getId()}`,
                inline: false,
            })
            .addFields({
                name: 'Tournament State',
                value: `${tourney.getState()}`,
                inline: false,
            })
            .addFields({
                name: 'Number of Entrants',
                value: `${tourney.getNumEntrants()}`,
                inline: false,
            })
            .addFields({
                name: 'Start Date',
                value: currentDay,
                inline: false,
            })

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

        await interaction.editReply({embeds: [embed]});
    }
};