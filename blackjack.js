const path = require("path");
const fs = require("fs");
var file = require("./bjInfo.json");
const Discord = require("discord.js");
require("dotenv").config();
const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);
var pictureFolder = fs.readdirSync(path.resolve(__dirname, './PokerCards'));
console.log(pictureFolder[0]);
client.on("ready", () => {
  console.log("Bot is ready");
});
client.on("message", async m => {
  if (m.author.bot) return;
  let filter = m => !m.author.bot;
  let collector = new Discord.MessageCollector(m.channel, filter);
  var playerName = "";
  if (m.content.toLowerCase() === "!startbet") {
    m.channel.send("Bot is collecting bet amounts now");
    // COLLECT MESSAGE
    collector.on("collect", message => {
      if (message.content === "!stop") {
        collector.stop();
        playerName = message.author.username;
      }
    });
    // COLLECTION ENDED NOW INITIALIZING PLAYERS
    collector.on("end", async (collectedItem, reason) => {
      function isDone() {
        if (playerName != null) {
          return new Promise(resolve => {
            resolve("resolved");
          });
        }
      }
      await isDone();
      m.channel.send("Bet collection has stopped by " + playerName);
      var contentArray = [];
      var userArray = [];
      const userBetAmount = {};
      for (let i = 0; i < collectedItem.size - 1; i++) {
        userArray.push(collectedItem.array()[i].author.username);
        contentArray.push(collectedItem.array()[i].content);
        if (userBetAmount[collectedItem.array()[i].author.username]) {
          continue;
        }
        userBetAmount[
          collectedItem.array()[i].author.username
        ] = collectedItem.array()[i].content;
      }
      for (const property in userBetAmount) {
        m.channel.send(`${property} : ${userBetAmount[property]}`);
      }
    });
  } 
  //DEAL CARDS
  const pictureFile = fs.readdirSync(path.resolve(__dirname, './PokerCards'));
  var cardValue = 0;
  var playerCards = {};
  var cards = [];
  var counter = 0;
  var aceReply = "";
  var blackjack = false;
  var cardInDeck = [];
  for (let i = 0; i < 53; i++) {
    cardInDeck.push(i);
  }
  if (m.content === "!draw") {
    m.author.send("hi " + m.author.username);
    for (let i = 0; i < 2; i++) {
      let randomIndex =
        cardInDeck[Math.floor(Math.random() * cardInDeck.length)];
      cardInDeck.splice(randomIndex, 1);
      var currentPicture = pictureFile[randomIndex];
      let blackjackEmbed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Here are your cards")
        .attachFiles([path.resolve(__dirname, `./PokerCards/${currentPicture}`)]);
      m.author.send({ embed: blackjackEmbed });
      let value = currentPicture.split("_");
      cards.push(value[0]);
    }
    if (
      (cards.includes("ace") == true &&
        (cards.includes("queen") || cards.includes("king") || cards.includes("jack")) == true) ||
      (cards[0] == "ace" && cards[1] == "ace")
    ) {
      m.author.send("blackjack");
      console.log("blackjack");
      blackjack = true;
    }

    console.log(cards);
    for (let items of cards) {
      if (blackjack == true) {
        playerCards[m.author.username] = "blackjack";
        file[m.author.username] = "blackjack";
        fs.writeFileSync("bjInfo.json", JSON.stringify(file));
        continue;
      } else if (items === "queen" || items === "king" || items === "jack") {
        cardValue += 10;
        playerCards[m.author.username] = cardValue;
        file[m.author.username] = cardValue;
        console.log("this is file" + file);
        fs.writeFileSync("bjInfo.json", JSON.stringify(file));
        counter++;
      } else if (items === "ace") {
        let filter = f => f.author.id === m.author.id;
        m.author
          .send(
            "U have drawn an Ace, do you want it to be 1 or 11  ? Please reply with either 1 or 11. Reply in 10 sec"
          )
          .then(() => {
            m.channel
              .awaitMessages(filter, {
                max: 1,
                time: 10000,
                errors: ["time"]
              })
              .then(collected => {
                if (collected.first().content == 1) {
                  aceReply = 1;
                  cardValue += Number(aceReply);
                  console.log(cardValue);
                  playerCards[m.author.username] = cardValue;
                  file[m.author.username] = cardValue;
                  fs.writeFileSync("bjInfo.json", JSON.stringify(file));
                  console.log(playerCards);
                  counter++;
                } else if (collected.first().content == 11) {
                  aceReply = 11;
                  cardValue += Number(aceReply);
                  playerCards[m.author.username] = cardValue;
                  file[m.author.username] = cardValue;
                  fs.writeFileSync("bjInfo.json", JSON.stringify(file));
                  console.log(playerCards);
                  console.log("aceReply is " + aceReply);
                  console.log("cardValue is" + cardValue);
                  counter++;
                } else {
                  m.author.send(`Terminated: Invalid Response`);
                }
              })
              .catch(collected => {
                m.author.send("Timeout");
              });
          });
      } else {
        cardValue += Number(items);
        playerCards[m.author.username] = cardValue;
        file[m.author.username] = cardValue;
        fs.writeFileSync("bjInfo.json", JSON.stringify(file));
        counter++;
      }
      console.log(cardValue + "final");
      if (counter == 2) {
        m.author.send(`your card value is ${cardValue}`);
        console.log(playerCards);
      }
    }
  }
});
