const path = require("path");
const fs = require("fs");
var file = require("./bjInfo.json");
const Discord = require("discord.js");
const { join } = require("path");
require("dotenv").config();
const client = new Discord.Client();
const pictureFolder = fs.readdirSync(path.resolve(__dirname, './PokerCards'));
const dict = {
    'king' : 13,
    'queen' : 12,
    'jack' : 11,
    'ace' : 1
}
client.login(process.env.BOT_TOKEN);
client.on('ready', ()=>{
    console.log("inBetween bot is ready");
});
var playerList = [];
var potSize = 5;
var playerIndex = 0;
var gameStarted = false;
client.on('message', message=>{
    if (message.author.bot) return;
    let filter = message => !message.author.bot && !(message.author.username in playerList);
    let collector = new Discord.MessageCollector(message.channel, filter);
    var playerName = "";
    // starting the game
    if(!gameStarted){
        if (message.content.toLowerCase() === "!inbetween") {
        message.channel.send("type !join to join the game");
        collector.on("collect", m => {
            if(m.content.toLowerCase()=== `!join` && !playerList.includes(m.author.username)){
            m.channel.send(`${m.author.username} has joined the game! `);
            playerList.push(m.author.username);
            }
            if (m.content === "!stop") {    
                collector.stop();
                playerName = m.author.username;
                m.channel.send("Registration has been stopped by " + playerName);
                gameStarted = true;
            }
          });
        collector.on("end", async collectMessage => {
            function isDone() {
                if (playerName != null) {
                    return new Promise(resolve => {
                    resolve("resolved");
                    });
                }
            }
            await isDone();
            message.channel.send(`participants: ${playerList}`); 
            message.channel.send(`current turn: ${playerList[playerIndex]}`)
            message.channel.send(" !draw to draw the card. !play (number) to play. e.g. !play 4  or !play 5  ")
        })
        }
    }
    if(gameStarted == true){
        if (message.content.toLowerCase() === "!draw" && message.author.username == playerList[playerIndex]){
        var cardInDeck = [];
        var cardName = [];
        for (let i = 0; i < 52; i++) {
        cardInDeck.push(i);
        }
        for(let i=0;i<2;i++){
        var randomIndex = cardInDeck[Math.floor(Math.random() * cardInDeck.length)];
        cardInDeck.splice(randomIndex, 1);
        var picture = pictureFolder[randomIndex];
        let card = picture.split("_")[0]
        if(card in dict){
            cardName.push(dict[card])
        }
        else{
        cardName.push(Number(card))
        }
        cardName.sort(function(a,b){return a-b});
        let blackjackEmbed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Here are your cards")
        .attachFiles([path.resolve(__dirname, `./PokerCards/${picture}`)]);
        message.channel.send({ embed: blackjackEmbed });
        }

        let filter = f => f.author.id === message.author.id;
        message.channel.send("!play (number) or !skip. POT SIZE IS " + potSize).then(async ()=>{
            message.channel.awaitMessages(filter, {
                max: 1,
                time: 15000,
                errors: ["time"]
              })
            .then(async collected =>{
                if(collected.first().content.includes("!play")){
                    var cardDrawn = false;
                    let contentArray = collected.first().content.split(" ");
                    let betAmount = contentArray[1];
                    let randomIndex = cardInDeck[Math.floor(Math.random() * cardInDeck.length)];
                    cardInDeck.splice(randomIndex, 1);
                    let picture = pictureFolder[randomIndex];
                    let card = picture.split("_")[0]
                    if(card in dict){
                    cardName.push(dict[card])
                    }
                    else{
                    cardName.push(parseInt(card))
                    }
                    console.log(cardName)
                    message.channel.send({files:[path.resolve(__dirname, `./PokerCards/${picture}`)]});
                    cardDrawn = true
                    setTimeout(()=> {
                    if(cardName[0] == cardName[1]){
                        if(betAmount.includes("red")){
                            if(picture.split("_")[2].includes("heart") || picture.split("_")[2].includes("diamond")){
                                potSize -= 3 * (parseInt(betAmount))
                                console.log("You win")
                            }
                            else{
                                potSize += 3* (parseInt(betAmount))
                                console.log("You lose")
                            }
                        }
                        else{
                            if(picture.split("_")[2].includes("spade") || picture.split("_")[2].includes("club")){
                                potSize -= 3 * (parseInt(betAmount))
                                console.log("You win")
                            }
                            else{
                                potSize += 3* (parseInt(betAmount))
                                console.log("You lose")
                            }
                        }
                    }
                    else if(cardName[0] < cardName[2] && cardName[2] < cardName[1]){
                        potSize -= parseInt(betAmount);
                        message.channel.send("you win")
                    }
                    else if (cardName[2] == cardName[0] || cardName[2] == cardName[1]){
                        potSize += (2 * parseInt(betAmount)) 
                        message.channel.send("LMAO GOAL POST BRO")
                    }
                    else{
                        potSize += parseInt(betAmount);
                        message.channel.send("you lose")
                    }
                    if(playerIndex == playerList.length -1){
                        playerIndex = 0;
                    }
                    else{
                        playerIndex ++;
                    }
                    message.channel.send("Turn ended. Current turn: " + playerList[playerIndex])
                    message.channel.send("Pot: " + potSize)
                    },1000)
                }
                else if (collected.first().content == "!skip"){
                    if(playerIndex == playerList.length -1){
                        playerIndex = 0;
                    }
                    else{
                        playerIndex ++;
                    }
                    message.channel.send("skipped. Current turn: " + playerList[playerIndex])
                }
                else{
                    message.channel.send(`Terminated: Invalid Response`);
                }
              })
            .catch(collected => {
                message.channel.send("Timeout");
            });
        })
        }
    }
});