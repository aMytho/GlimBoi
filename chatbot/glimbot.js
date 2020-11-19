var fs = require("fs") //handles Files (writing and reading)
var request = require("request");//Handles sending requests to the api.
var CommandHandle = require("./lib/commands.js") //handles commands
var QuoteHandle = require("./lib/quotes.js") //handles qoutes
var AuthHandle = require("./lib/auth.js") //handles qoutes
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(__dirname)
let botSettingsRaw = fs.readFileSync('settings/settings.JSON');
let settings = JSON.parse(botSettingsRaw);

if (settings.GlimBot.startLog == true) { //Runs at startup to show your config
    console.log(`Auth: ${settings.Auth.Oauth}`);
    console.log("Mods:")
    settings.Mods.ModList.forEach(element => {
        console.log('\x1b[36m', `${element.Name} `,'\x1b[0m');
        console.log('\x1b[38m', `GlimeshMod: ${element.GlimeshMod} `,'\x1b[0m');
    });
    console.log('\x1b[36m%s\x1b[0m', '______________________'); 
    if (settings.Points.enabled == true) {
        console.log("Points:");
        console.log(" Name: " + "\x1b[33m" + settings.Points.name + "\033[0m");
        console.log(" Starting Amount: " + "\x1b[33m" + settings.Points.StartingAmount + "\033[0m");
        console.log(" Points per 15 minutes: " + "\x1b[33m" + settings.Points.accumalation + "\033[0m");
        console.log("\x1b[33m" + "______________________" + "\033[0m");
    };
    if (settings.Games.enabled == true) {
        console.log("Games:");
        console.log(" Numbers: " + "\x1b[34m" + settings.Games.Numbers + "\033[0m");
        console.log(" BankHeist: " + "\x1b[34m" + settings.Games.BankHeist + "\033[0m");
        console.log(" Trivia: " + "\x1b[34m" + settings.Games.Trivia + "\033[0m");
        console.log("\x1b[34m" + "______________________" + "\033[0m");
    };
    if (settings.Commands.enabled == true) {
        console.log("Commands:");
        console.log(" Cooldown: " + "\x1b[35m" + settings.Commands.cooldown + "m" + "\033[0m");
        console.log(" Prefix: " + "\x1b[35m" + settings.Commands.Prefix + "\033[0m");
        console.log(" Chat Errors: " + "\x1b[35m" + settings.Commands.Error + "\033[0m");
        console.log("\x1b[35m" + "______________________" + "\033[0m");
    };
    console.log("GlimBot:");
        console.log(" Chat Control: " + "\x1b[38m" + settings.GlimBot.chatControls + "\033[0m");
        console.log("\x1b[38m" + "______________________" + "\033[0m");
    console.log("Logging Completed!");
}

var authScheme = {
  clientID: "a",
  secretID: "b",
  token: "c"
}

QuoteHandle.updatePath("..")
//QuoteHandle.addquote("Mytho", "loads of data");

try{
let authfile = JSON.parse(fs.readFileSync('data/auth.JSON'))
 var clientID = authfile.clientID;
 authScheme.clientID = clientID
 var secretID = authfile.secretID;
 authScheme.secretID = secretID
 var token = authfile.token;
 console.log(authScheme)
 if (clientID == undefined || secretID == undefined || token == undefined) {console.log('One or more properties in the auth.JSON file are incorrect or missing. Please go to app/resources/chatbot/data/auth.JSON and enter the correct information.')};
 AuthHandle.Auth(authScheme)
} catch(error) {
    console.log(error);
    console.log("Welcome! We are creating your auth file.");
    console.log("To exit at any time press CTRL+C . Please do so when the bot is not activly doing something to prevent errors.")
    rl.question("Please enter the client ID for the bot. Confused? Look at the instructions file!", function(name) {
      rl.question("Please enter the secret ID", function(country) {
          console.log(`Creating file with client ID ${name} and secret ID ${country}`);
          console.log("If this is incorrect you can go to app/resources/chatbot/data/auth.JSON to replace it.");
          authScheme.clientID = name;
          authScheme.secretID = country;
          authScheme.token = "You need a token!"
          rl.close();
          fs.writeFileSync('data/auth.JSON', JSON.stringify(authScheme));
          AuthHandle.Auth(authScheme);
      });
  });
    //AUTH FUNCTION
}
/*
const WebSocket = require("ws");
const auth = require("./lib/auth.js");
const url =
  "wss://glimesh.tv/api/socket/websocket?vsn=2.0.0&token=" + authString;
const connection = new WebSocket(url);

connection.on("open", function open() {
  connection.send('["6","6","__absinthe__:control","phx_join",{}]');
  connection.send(
    `["6","6","__absinthe__:control","doc",{"query":"subscription{ chatMessage(channelId: 6) { user { username avatar } message } }","variables":{} }]`
  );

  setInterval(() => {
    connection.send('[null,"6","phoenix","heartbeat",{}]');
  }, 30000);
});

connection.on("message", function incoming(data) {
  //console.log(data)
  try {
    //First check for heartbeat message.
    var heartbeat = JSON.parse(data);
    if (heartbeat[4].status !== undefined) {
      console.log("Status: " + heartbeat[4].status);
    } else {
      //Its probably a chat message
      try {
        var chatMessage = JSON.parse(data);
        if (chatMessage[4].result.data !== undefined) {
          console.log(
            chatMessage[4].result.data.chatMessage.user.username +
            ": " +
            chatMessage[4].result.data.chatMessage.message
          );
        }
      } catch (e2) {
        console.log(e2);
      }
    }
  } catch (e1) {
    console.log(e1);
  }

  //  connection.send(`["6","6","__absinthe__:control","doc",{"query":"subscription{ chatMessage(channelId: 2) { user { username avatar } message } }","variables":{} }]`)
});

connection.onclose = function (event) {
  if (event.wasClean) {
    console.log(
      `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
    );
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log("[close] Connection died");
  }
};

connection.onerror = function (error) {
  console.log(`[error] ${error.message}`);
  console.log("Probably an auth issue. Please reauthenicate");
};


/*
connection.send(
`["6","6","__absinthe__:control","doc",{"query":"query{ channel(username: \"clone1018\") { user { username avatar } title } }","variables":{} }]`
);
*/

//console.log('Connecting to USER chatroom');
/*
let testCommand = fs.readFileSync('data/command.JSON');
let chatMessage = JSON.parse(testCommand);
let message = chatMessage.message;
console.log(message)

CommandHandle.updatePath(`./`)
CommandHandle.syncCommands(); //Updates the commands made last stream to the main command list.
CommandHandle.importCommands(); //Imports all the commands to be read by the bot.

if (message.startsWith("!") == true) { //if its one of our command...
    let messageContent = message.slice(1) //Remove the !
    if (messageContent.startsWith("command add")) {
        let arguements = messageContent.split(" ");
        CommandHandle.addCommand(arguements[2], null, ADD, 0, "everyone", null)
        
    } else {
        let arguements = messageContent.split(" ");
        CommandHandle.checkCommand(arguements, messageContent);
    }
    let arguements = messageContent.split(" ") // Very useful later. Specify paramaters for commands and other stuff.
}

CommandHandle.addCommand("another", null, "one", 5, 5, "everyone", null);
*/