# GoldyRL - An Esports Discord Bot

## Authors
Project Leader: 
Matt Dixey - TitanHawk17

Project Contributors:
Corbin Donner - Nut

## Purpose
GoldyRL is an Esports Discord Bot that is designed to store competitive match history in any significant event as determined by its users. With an original design for Rocket League, it has the capability to store hundreds of competitive matches and rosters to provide quick access to a vast amount of information.

Some applications for GoldyRL include but are not limited to
 - Graphic Designers able to obtain matchup information
 - Statisicians immediately find out matchup history between two rivals
 - Broadcasters quickly create scenes showing the next team's competitive match history
 - Casters can get a quick refresher of the last time a team was successful in a competitive environment

There is no limit to what GoldyRL can't do for the competitive esports community. With built-in permission handling to prevent cyber attacks and internet trolls from disabling the program, it is a safe addition to your Discord server.

## How To Use
For GoldyRL to be utilized, it must join your Discord server. From there, GoldyRL relies on two important Discord roles to limit user permissions:

1. `Operations`
Any user with this role will have unrestricted access to GoldyRL and its commands. Please be very careful with deciding who has this role.

2. `GoldyRL Master`
Users with this role will be able to execute all the commands EXCEPT the `/reset` command as that is kept exclusive to `Operations` users. However, it is still important to note that Discord server administrators should be careful distributing this role.

GoldyRL will only respond to commands requested in a text channel named exactly `match-history` (should appear as `#match-history` on the side list of channels in the Discord server). 

__IMPORTANT NOTICE__
If GoldyRL replies to a message with `... GoldyRL is thinking...`, do NOT execute another command as GoldyRL needs time to finish completing it's response before it can process another command.

## Commands
GoldyRL is able to perform several commands successfully. Please keep an eye on this README as GoldyRL will only grow more capable of what it can do.

__MATCH COMMANDS__
1. `/addmatch [TEAM_ONE] [TEAM_ONE_SCORE] [TEAM_TWO] [TEAM_TWO_SCORE]`
2. `/addtournament [TOURNAMENT_SLUG] [EVENT_SLUG]`
3. `/deletelast [TEAM_NAME]`
4. `/getdata [TEAM_NAME]`
5. `/gettournamentinfo [TOURNAMENT_SLUG] [EVENT_SLUG]`
6. `/list`
7. `/matchup [TEAM_ONE] [TEAM_TWO]`
8. `/reset`

__ROSTER COMMANDS__
1. `/addroster [TEAM_NAME] [PLAYER_ONE] [PLAYER_TWO] [PLAYER_THREE] [optional: add up to 3 more players]`
2. `/checkplayer [PLAYER_NAME]`
3. `/checkregistration [TOURNAMENT_SLUG] [EVENT_SLUG] [TEAM_NAME]`
4. `/checkteam [TEAM_NAME]`
5. `/deleteroster [TEAM_NAME]`
6. `/getplacement [TOURNAMENT_SLUG] [EVENT_SLUG] [TEAM_NAME]`
7. `/getroster [TEAM_NAME]`
8. `/gettourneyrosters [TOURNAMENT_SLUG] [EVENT_SLUG]`
9. `/listrosters`
10. `/resetrosters`
11. `/rostersub`

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
 - START_GG_TOKEN

3. Run `node index.js` to activate the bot!

A few notes to keep in mind during development:
1. If you are loading the commands for the first time OR modify any of the existing slash commands, you must run `node deploy-commands.js`.
2. If you are running the bot, it will NOT automatically apply changes you make after each save. You will need to rerun `node index.js` to apply changes.