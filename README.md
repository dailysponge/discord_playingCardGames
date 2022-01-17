# Before starting the game:

1.Key in discord bot token under .env <br>
2. Add the bot into desired discord server <br>
3. Download pokercards image in attached folder named Pokercards

# inBetween Bot

Bot Commands:

 ` !inbetween ` : initializes and starts the game

`!join`: enters playerID into playerList array  { player_id : amount of money } 

`!stop`: stops player collection, begins game initialization

`!draw`: draws card and sends poker images to the root server

`!play`: initializes the play procedure and adds amount to pot

`!skip`: skips the player turn and does not initialize play procedure

`!topup`: deducts money from player and adds into pot

`!wallet`: Displays wallet amount 

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




# blackjack Bot
Bot Commands:

`!startbet` : initiates discord message collection for bet amounts
`!stop` : stops discord message collection and saves player data as {playerID}: {betAmount}. 
`!draw`: Issues a random card to the player's direct message. Deck is NOT refreshed.
`!end`: player ends their turn. Next player in rotation gets the issue the `!draw` command
`!open`: Dealer gets to choose which playerID he wants to open and reveal the cards.
`!wallet`: Displays wallet amount 
# Game plan:
`!startbet` 
1) Game is started by any player in the server. Bet collection starts at the same time. Players key in their desired bet amounts and data is stored in the form of an array

`!stop`:
2) Bet collection is stopped by any player in the server. Array information is finalized and displayed back in the main discord server. Cards are sent directly to each player's direct message for privacy. If the player draws a blackjack, he wins the round automatically and turn is skipped. If an ace is drawn, player has 10 seconds to decide if the value of that Ace be 1 or 11.


`!draw`
3) Players can reply !draw to draw cards. Card drawing is done in order of player registration. After card is drawn, player can still choose to decide to draw if total value is not over 21.

`!end` 
4) Player ends the turn and next player in line repeats step 3

`!open`
5) Dealer gets to decide if he wants to `!draw` or `!open`. After round ends, bet amounts are transferred to and fro dealer's wallet accordingly.
