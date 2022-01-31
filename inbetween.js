const path = require("path");
const fs = require("fs");
var file = require("./inbetween.json");
const Discord = require("discord.js");
const { join } = require("path");
const { cpuUsage } = require("process");
require("dotenv").config();  # store bot_token in .env file 
const client = new Discord.Client();
const pictureFolder = fs.readdirSync(path.resolve(__dirname, "./PokerCards"));
const dict = {
  king: 13,
  queen: 12,
  jack: 11,
  ace: 1
};
client.login(process.env.BOT_TOKEN);
client.on("ready", () => {
  console.log("inBetween bot is ready");
});
var playerList = [];
var playerData = [];
var potSize = 0;
var playerIndex = 0;
var gameStarted = false;
client.on("message", message => {
  let command = message.content.split(" ")[0].slice(1);
  let args = message.content.replace("." + command, "").trim();
  if (message.author.bot) return;
  let filter = message =>
    !message.author.bot && !(message.author.username in playerList);
  let collector = new Discord.MessageCollector(message.channel, filter);
  var playerName = "";
  function updateWallet(){
    let playerData = []
    let data = fs.readFileSync("inbetween.json");
    let dataObject = JSON.parse(data);
    delete dataObject.type;
    delete dataObject.data;
    let keys = Object.keys(dataObject);
    for (var i = 0; i < keys.length; i++) {
        playerData.push(`${keys[i]} : ${dataObject[keys[i]]}`);
    }
    return playerData;
    }
  // starting the game
  if (!gameStarted) {
    if (message.content.toLowerCase() === "!inbetween") {
      var startGameEmbed = new Discord.MessageEmbed()
        .setColor("#43efd0")
        .setTitle("!join to join or !stop to start");
      message.channel.send(startGameEmbed);
      collector.on("collect", m => {
        if (
          m.content.toLowerCase() === `!join` &&
          !playerList.includes(m.author.username)
        ) {
          let welcomeEmbed = new Discord.MessageEmbed()
            .setColor("#43efd0")
            .setTitle(`${m.author.username} has joined the game!`);
          message.channel.send(welcomeEmbed);
          playerList.push(m.author.username);
          //INITIALIZING POT SIZE
          file[m.author.username] = -1;
          fs.writeFileSync("inbetween.json", JSON.stringify(file));
        }
        if (m.content === "!stop") {
          collector.stop();
          playerName = m.author.username;
          m.channel.send("Registration has been stopped by " + playerName);
          gameStarted = true;
          potSize += playerList.length;
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
        let data = fs.readFileSync("inbetween.json");
        let dataObject = JSON.parse(data);
        delete dataObject.type;
        delete dataObject.data;
        let keys = Object.keys(dataObject);
        for (var i = 0; i < keys.length; i++) {
          playerData.push(`${keys[i]} : ${dataObject[keys[i]]}`);
        }
        const introductionEmbed = new Discord.MessageEmbed()
          .setColor("#40e0d0")
          .setTitle("GAMEPLAY INSTRUCTION")
          .setDescription(
            `!draw to draw the card. !play (number) to play. e.g. !play 4  or !play 5. !skip to skip
            if 2 same cards then e.g. !play 4red or !5black.
            !topup to add money to the pot and deduct money from your wallet.
            !wallet to see how much everyone win and lose`
          )
          .addFields(
            { name: "PARTICIPANTS", value: playerList },
            { name: "CURRENT TURN", value: playerList[playerIndex] },
            { name: "POT SIZE", value: potSize },
            { name: "PLAYER WALLET", value: updateWallet() }  
          );
        message.channel.send(introductionEmbed);
      });
    }
  }
  if (gameStarted == true) {
    if (message.content.toLowerCase() == "!shutdown") {
      let file = fs.readFileSync("inbetween.json");
      let fileObject = JSON.parse(file);
      fileObject = {};
      playerData = [];
      fs.writeFileSync("inbetween.json", JSON.stringify(fileObject));
      message.channel.send("resetting");
      setTimeout(() => {
        client.destroy(), 1000;
      });
    }
    if(message.content.toLowerCase() == "!wallet"){
      const walletEmbed = new Discord.MessageEmbed()
      .setColor("#39FF14")
      .setTitle("PLAYER WALLET")
      .setDescription(updateWallet())
      message.channel.send(walletEmbed)
    }
    if (message.content.toLowerCase() == "!topup") {
      potSize += playerList.length;
      message.channel.send("POTSIZE: " + potSize);
      let data = fs.readFileSync("inbetween.json");
      let dataObject = JSON.parse(data);
      for (let playerData in dataObject) {
        dataObject[playerData] -= 1;
        fs.writeFileSync("inbetween.json", JSON.stringify(dataObject));
      }
      var topUpEmbed = new Discord.MessageEmbed()
        .setColor("#40e0d0")
        .setTitle("POT TOPPED UP")
        .addFields({ name: "POTSIZE", value: potSize },
        {name: "WALLET", value: (updateWallet())});
      message.channel.send(topUpEmbed);
    }
    if (
      message.content.toLowerCase() === "!draw" &&
      message.author.username == playerList[playerIndex]
    ) {
      var cardInDeck = [];
      var cardName = [];
      for (let i = 0; i < 52; i++) {
        cardInDeck.push(i);
      }
      for (let i = 0; i < 2; i++) {
        var randomIndex =
          cardInDeck[Math.floor(Math.random() * cardInDeck.length)];
        cardInDeck.splice(randomIndex, 1);
        var picture = pictureFolder[randomIndex];
        let card = picture.split("_")[0];
        if (card in dict) {
          cardName.push(dict[card]);
        } else {
          cardName.push(Number(card));
        }
        cardName.sort(function(a, b) {
          return a - b;
        });
        let blackjackEmbed = new Discord.MessageEmbed()
          .setColor("#0099ff")
          .setTitle("Here are your cards")
          .attachFiles([path.resolve(__dirname, `./PokerCards/${picture}`)]);
        message.channel.send({ embed: blackjackEmbed });
      }

      const filter = f => f.author.id === message.author.id && f.content.startsWith("!play") && 
      f.content.length > 6 &&
      parseInt(f.content.split(" ")[1]) <= potSize;
      message.channel
        .send("!play (number) or !skip. POT SIZE IS " + potSize)
        .then(async () => {
          message.channel
            .awaitMessages(filter, {
              max: 1,
              time: 30000,
              errors: ["time"]
            })
            .then(async collected => {
              console.log(filter.content)
              if (collected.first().content.includes("!play")) {
                var cardDrawn = false;
                let contentArray = collected.first().content.split(" ");
                let betAmount = contentArray[1];
                let randomIndex =
                  cardInDeck[Math.floor(Math.random() * cardInDeck.length)];
                cardInDeck.splice(randomIndex, 1);
                let picture = pictureFolder[randomIndex];
                let card = picture.split("_")[0];
                if (card in dict) {
                  cardName.push(dict[card]);
                } else {
                  cardName.push(parseInt(card));
                }
                console.log(cardName);
                message.channel.send({
                  files: [path.resolve(__dirname, `./PokerCards/${picture}`)]
                });
                cardDrawn = true;
                var turnResult = "";
                setTimeout(() => {
                  if (cardName[0] == cardName[1]) {
                    //THREE CARDS ALL SAME = LOSE 3X MONEY
                    if (cardName[2] == cardName[0]) {
                      potSize += 3 * parseInt(betAmount);
                      turnResult = "GG BRO";
                      let data = fs.readFileSync("inbetween.json");
                      let dataObject = JSON.parse(data);
                      dataObject[message.author.username] -= 3 * parseInt(betAmount);
                      fs.writeFileSync("inbetween.json", JSON.stringify(dataObject));
                    } else if (betAmount.includes("red")) {
                      if (
                        picture.split("_")[2].includes("heart") ||
                        picture.split("_")[2].includes("diamond")
                      ) {
                        potSize -= parseInt(betAmount);
                        turnResult = "YOU WIN";
                        let data = fs.readFileSync("inbetween.json");
                        let dataObject = JSON.parse(data);
                        dataObject[message.author.username] += parseInt(betAmount);
                        fs.writeFileSync(
                          "inbetween.json",
                          JSON.stringify(dataObject)
                        );
                      } else {
                        potSize += parseInt(betAmount);
                        turnResult = "YOU LOSE";
                        let data = fs.readFileSync("inbetween.json");
                        let dataObject = JSON.parse(data);
                        dataObject[message.author.username] -= parseInt(betAmount);
                        fs.writeFileSync(
                          "inbetween.json",
                          JSON.stringify(dataObject)
                        );
                      }
                    } else {
                      if (
                        picture.split("_")[2].includes("spade") ||
                        picture.split("_")[2].includes("club")
                      ) {
                        potSize -= parseInt(betAmount);
                        turnResult = "YOU WIN";
                        let data = fs.readFileSync("inbetween.json");
                        let dataObject = JSON.parse(data);
                        dataObject[message.author.username] += parseInt(betAmount);
                        fs.writeFileSync(
                          "inbetween.json",
                          JSON.stringify(dataObject)
                        );
                      } else {
                        potSize += parseInt(betAmount);
                        turnResult = "YOU LOSE";
                        let data = fs.readFileSync("inbetween.json");
                        let dataObject = JSON.parse(data);
                        dataObject[message.author.username] -= parseInt(betAmount);
                        fs.writeFileSync(
                          "inbetween.json",
                          JSON.stringify(dataObject)
                        );
                      }
                    }
                  } else if (
                    cardName[0] < cardName[2] &&
                    cardName[2] < cardName[1]
                  ) {
                    potSize -= parseInt(betAmount);
                    turnResult = "YOU WIN";
                    let data = fs.readFileSync("inbetween.json");
                    let dataObject = JSON.parse(data);
                    dataObject[message.author.username] += parseInt(betAmount);
                    fs.writeFileSync("inbetween.json", JSON.stringify(dataObject));
                  } else if (
                    cardName[2] == cardName[0] ||
                    cardName[2] == cardName[1]
                  ) {
                    potSize += 2 * parseInt(betAmount);
                    turnResult = "LMAO GOAL POST BRO";
                    let data = fs.readFileSync("inbetween.json");
                    let dataObject = JSON.parse(data);
                    dataObject[message.author.username] -= 2 * parseInt(betAmount);
                    fs.writeFileSync("inbetween.json", JSON.stringify(dataObject));
                  } else {
                    potSize += parseInt(betAmount);
                    turnResult = "YOU LOSE";
                    let data = fs.readFileSync("inbetween.json");
                    let dataObject = JSON.parse(data);
                    dataObject[message.author.username] -= parseInt(betAmount);
                    fs.writeFileSync("inbetween.json", JSON.stringify(dataObject));
                  }
                  // LOOP PLAYER TURNS
                  if (playerIndex == playerList.length - 1) {
                    playerIndex = 0;
                  } else {
                    playerIndex++;
                  }
                  var postTurnEmbed = new Discord.MessageEmbed()
                    .setColor("#40e0d0")
                    .setTitle(turnResult)
                    .addFields(
                      { name: "CURRENT TURN", value: playerList[playerIndex] },
                      { name: "POT SIZE", value: potSize }
                    );
                  message.channel.send(postTurnEmbed);
                }, 1000);
              } else if (collected.first().content == "!skip") {
                if (playerIndex == playerList.length - 1) {
                  playerIndex = 0;
                } else {
                  playerIndex++;
                }
                message.channel.send(
                  "skipped. Current turn: " + playerList[playerIndex]
                );
              } else {
                message.channel.send(`Terminated: Invalid Response`);
              }
            })
            .catch(collected => {
              message.channel.send("Timeout");
              if (playerIndex == playerList.length - 1) {
                playerIndex = 0;
              } else {
                playerIndex++;
              }
              var timeoutEmbed = new Discord.MessageEmbed()
              .setColor("#40e0d0")
              .setTitle("TIMEOUT")
              .addFields(
                {name:"CURRENT TURN", value: playerList[playerIndex]}
              )
              message.channel.send(timeoutEmbed)
            });
        });
    }
  }
});
