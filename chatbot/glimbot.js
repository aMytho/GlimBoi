var fs = require("fs") //handles Files (writing and reading)
var request = require("request");//Handles sending requests to the api.
var CommandHandle = require("./lib/commands.js") //handles commands


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