const path = require("path");
const fs = require("fs");
var file = require("./bjInfo.json");
const Discord = require("discord.js");
const { join } = require("path");
require("dotenv").config();
const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);
const pictureFolder = fs.readdirSync(path.resolve(__dirname, './PokerCards'));
//console.log(pictureFolder)
client.on('ready', ()=>{
    console.log("inBetween bot is ready");
});
playerList = [];
potSize = 5;
playerIndex = 0;
gameStarted = false;
client.on('message', message=>{
    if (message.author.bot) return;
    let filter = message => !message.author.bot && !(message.author.username in playerList);
    let collector = new Discord.MessageCollector(message.channel, filter);
    var playerName = "";
    // starting the game
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
            message.channel.send(" !draw to draw the card. !play (number) to play. e.g. !play 4     !play 5  ")
            message.channel.send("NO WHAT HAPPENS DO NOT TYPE !inbetween")
        })
    };
    if(gameStarted == true){
        if (message.content.toLowerCase() === "!draw" && message.author.username == playerList[playerIndex]){
        var cardInDeck = [];
        for (let i = 0; i < 52; i++) {
        cardInDeck.push(i);
        }
        for(let i=0;i<2;i++){
        var randomIndex =
        cardInDeck[Math.floor(Math.random() * cardInDeck.length)];
        cardInDeck.splice(randomIndex, 1);
        //console.log(randomIndex);
        var picture = pictureFolder[randomIndex];
        //console.log(picture)
        let blackjackEmbed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Here are your cards")
        .attachFiles([path.resolve(__dirname, `./PokerCards/${picture}`)]);
        message.channel.send({ embed: blackjackEmbed });
        }

        let filter = f => f.author.id === message.author.id;
        message.channel.send("!play (number) to play the game, else !skip to not play").then(()=>{
            message.channel.awaitMessages(filter, {
                max: 1,
                time: 15000,
                errors: ["time"]
              })
            .then(collected =>{
                if(collected.first().content.includes("!play")){
                    let contentArray = collected.first().content.split(" ");
                    let betAmount = contentArray[1];
                    console.log(betAmount);
                    let randomIndex = cardInDeck[Math.floor(Math.random() * cardInDeck.length)];
                    cardInDeck.splice(randomIndex, 1);
                    let picture = pictureFolder[randomIndex];
                    //console.log(randomIndex)
                    message.channel.send({files:[path.resolve(__dirname, `./PokerCards/${picture}`)]});
                    if(playerIndex == playerList.length -1){
                        playerIndex = 0;
                    }
                    else{
                        playerIndex ++;
                    }
                    message.channel.send("Turn ended. Current turn: " + playerList[playerIndex])
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
    //console.log(playerList);
    //console.log(playerList[playerIndex])
});