# inBetween Bot
# Before starting the game:

1.Key in discord bot token under .env 

2. Add the bot into desired discord server
3. Download pokercards image in attached files OR enable API call (slower)


Bot Commands:

 ` !inbetween ` : initializes and starts the game

`!join`: enters playerID into playerList array  { player_id : amount of money } 

`!stop`: stops player collection, begins game initialization

`!draw`: draws card and sends poker images to the root server

`!play`: initializes the play procedure and adds amount to pot

`!skip`: skips the player turn and does not initialize play procedure

`!topup`: deducts money from player and adds into pot

`!wallet`: Displays wallet amount of 


`!shutdown`: Destroys instance of bot and shutdown


# Game plan:

`!inbetween`
1) Starts the bot initiation

`!join`
2) Begin join process and allows players to start joining 

`!stop`
3) Terminates the join process

`!draw`
4) Allows players to draw 2 cards from poker deck (refreshes every turn)

`!play / !skip`
5) Current player turn to decide course of action to take.
!play -> Draws 2 cards
!skip -> turn ends and proceeds to next player

`!topup`
6) Deducts ${money} from all players' wallet and channel into {POTSIZE}

`!wallet`
7) Display information of game state
{ name: "PARTICIPANTS", value: playerList },
{ name: "CURRENT TURN", value: playerList[playerIndex] },
{ name: "POT SIZE", value: potSize },
{ name: "PLAYER WALLET", value: updateWallet() }
