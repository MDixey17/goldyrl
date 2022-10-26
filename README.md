# GoldyRL - A Rocket League Discord Bot

## Authors
Project Leader: 
Matt Dixey - TitanHawk17

Project Contributors:
Corbin Donner - Nut

## Purpose
GoldyRL was designed to allow for communities to track their team's stats and matches in an automated fashion. The first iteration required significant manual input and would be inefficient to users. With the recent notice of start.gg's API, this has become possible.

The original community is the University of Minnesota Rocket League club but this bot may be open to extensibility to fulfill the needs of other communities. 

## How To Use
GoldyRL must be in your Discord server in order for users to have access to its abilities. The following roles must also be added and assigned to at least one user in your community
 1. Operations
 Members with this role will have unrestricted access to the database that GoldyRL maintains.

 2. GoldyRL Master
 Members with this role will be able to add new data to the database, but not modify those contents.

## Developers - How To Test
After cloning the repository, please follow these instructions to corectly set up GoldyRL:

1. Run `npm install`
This will create the node_modules folder that is ignored by the `.gitignore` file. You will need this to have access to Discord's API.

2. Create `.env`
This file will contain the appropriate variables that must be kept hidden to prevent unwanted access to GoldyRL. Inside this file will be:
 - DISCORD_TOKEN
 - TEST_GUILD_ID
 - UMN_GUILD_ID
 - CLIENT_ID

3. Run `node index.js` to activate the bot!

A few notes to keep in mind during development:
1. If you are loading the commands for the first time OR modify any of the existing slash commands, you must run `node deploy-commands.js`.
2. If you are running the bot, it will NOT automatically apply changes you make after each save. You will need to rerun `node index.js` to apply changes.