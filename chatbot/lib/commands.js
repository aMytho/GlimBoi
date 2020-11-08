var fs = require("fs");
const app = require('electron')
const Datastore = require('nedb')


var path = "./";
var otherPath = null;

let commandsDB;
let quotesDB;
let usersDB;
//let commandsDBTest = new Datastore({ filename: `${path}data/commands.db`, autoload: true });

class Command {
  constructor(
    commandName,
    arguements,
    commandData,
    uses,
    points,
    rank,
    special
  ) {
    this.commandName = commandName; //The name of the command
    this.arguements = arguements; //Paramaters to send to the command
    this.message = commandData; // No explanation here
    this.uses = uses; //Times the command has been used.
    this.points = points; //Points required per command
    this.rank = rank; //Default is everyone
    this.special = special; //oooo
  }
}

//This array will be filled with every variable in a command and is reset once the command is sent.
var variableList = [];
//This array contains all possible variables for commands.
var listofvariables = [
  "$target",
  "$user",
  "$time",
  "$watchtime",
  "$cmdcount",
  "$game",
];

var todaysCommand = {}; //New commands
var commandAddedToday = false;
var importedCommands = []; //Existing Commands

//Updates the file path. Electron and the non electron build use different URLS.
function updatePath(GUI) {
  console.log("path is " + GUI);
  path = GUI;
 commandsDB = new Datastore({ filename: `${path}/chatbot/data/commands.db`, autoload: true });

 //quotesDB = new Datastore({ filename: `${path}data/quotes.db`, autoload: true });
 //usersDB = new Datastore({ filename: `${path}data/users.db`, autoload: true });
}


//Adds a command
function addCommand(commandName, arguements, commandData, uses, points, rank, special) {
  var newCommand = new Command(commandName, arguements, commandData, uses, points, rank, special);
  try {
    //inserts a document as a command. Uses the command made above.
    commandsDB.insert(newCommand, function(err, doc) {
    console.log('Inserted', doc.commandName, 'with ID', doc._id);
  });
  } catch(e) {
    console.log(e);
    console.log("Failure to add Command. Ensure only one instance of the bot is running and check your commands.db file (in the data folder) for curruption.")
  }
  return newCommand;
}

/*Removes a command from chat. 
function removeCommand(commandName) {
  fs.writeFileSync(`${path}data/newCommands.JSON`, JSON.stringify(todaysCommand), function (err) {
    console.log(`!${commandName} is now a command`)
    if (err) return console.log(err);
  });
  return newCommand;
}
*/

//Adds a command from Electron. 
/*
function addCommandE(commandName, arguements, commandData, uses, points, rank, special) {
  var newCommand = new Command(commandName, arguements, commandData, uses, points, rank, special);
  todaysCommand[`${newCommand.commandName}`] = newCommand //adds it a var which holds all of todays commands. It is written to a file which is later written to the main list.
  commandAddedToday = true;
  fs.writeFileSync(`chatbot/data/newCommands.JSON`, JSON.stringify(todaysCommand), function (err) {
    console.log(`!${commandName} is now a command`)
    if (err) return console.log(err);
  });
  return newCommand;
}
*/

//Adds the commands from the previous session to the main list. This is run before the old commands are imported.
function syncCommands() {/*
  var importedCommandsDataOld = fs.readFileSync(`${path}data/commands.JSON`, "utf-8");
  var importedCommandsDataNew = fs.readFileSync(`${path}data/newCommands.JSON`, "utf-8");
  try {
    importedCommandsDataOld = JSON.parse(importedCommandsDataOld);
    importedCommandsDataNew = JSON.parse(importedCommandsDataNew);
    var test = {...importedCommandsDataOld, ...importedCommandsDataNew}
    console.log(test);
    //Write to the main command list.
    fs.writeFileSync(`${path}data/commands.JSON`, JSON.stringify(test), function (err) {
      if (err) return console.log(err);
    });
    //Deletes the new command list.
    fs.writeFileSync(`${path}data/newCommands.JSON`, "", function (err) {
      if (err) return console.log(err);
    });
  } catch (error) {
    console.log(error);
    console.log("No command to add. Ignore error!")
  }
  */
}

//Removes a command
function removeCommand(commandName) {
  commandsDB.remove({ commandName: commandName }, {}, function (err, numRemoved) {
    console.log(commandName + " was removed from the db")
  });
}

//Edits a command
function editCommand(commandName, arguements, commandData, commandUses, commandPoints, commandRank, special) {
  console.log(commandName, arguements, commandData, commandUses, commandPoints, commandRank, special)
  commandsDB.update({ commandName: commandName }, { $set: {arguements : arguements, message: commandData, uses: commandUses, points: commandPoints, rank: commandRank, special: special} }, {}, function (err, numReplaced) {
    console.log("Replacing " + commandName);
});
}

//Checks if a command exists and runs it if it does.
function checkCommand(arguements, messageContent) {
  try {
    if (importedCommands[`${arguements[0].toLowerCase()}`] !== undefined) {
      //Search the Command List.
      runCommand(arguements, messageContent, false); //Runs the command.
    } else if (todaysCommand[`${arguements[0].toLowerCase()}`] !== undefined) {
      //Search the newly added Command List.
      runCommand(arguements, messageContent, true); //Runs the command.
    } else {
      console.log("!" + arguements[0] + " is not a command");
    }
  } catch (error) {
    console.log(arguements[0] + "is not a command!");
    console.log(error);
  }
}

//Runs the command
function runCommand(arguements, messageContent, isNew) {
  console.log("Running !" + arguements[0]);
  console.log(" Message:" + messageContent);
  if (isNew == true) {
    var chatMessage = todaysCommand[`${arguements[0].toLowerCase()}`].message;
    //Check the command to see if it has any variables.
    variableList[0] = chatMessage.includes("$target");
    variableList[1] = chatMessage.includes("$user");
    variableList[2] = chatMessage.includes("$time");
    variableList[3] = chatMessage.includes("$watchtime");
    variableList[4] = chatMessage.includes("$cmdcount");
    variableList[5] = chatMessage.includes("$game");
  } else {
  var chatMessage = importedCommands[`${arguements[0].toLowerCase()}`].message;
  //Check the command to see if it has any variables.
  variableList[0] = chatMessage.includes("$target");
  variableList[1] = chatMessage.includes("$user");
  variableList[2] = chatMessage.includes("$time");
  variableList[3] = chatMessage.includes("$watchtime");
  variableList[4] = chatMessage.includes("$cmdcount");
  variableList[5] = chatMessage.includes("$game");}
  //We check if the command has variables against the variable list.
  variableList.forEach(function (element, i) {
    //For every variable we check if it is in the messageContent
    if (variableList[`${i}`] == true && variableList[`${i}`] !== undefined) {
      //If the var is in the string
      console.log(listofvariables[`${i}`] + " is in the command.");
      replaceVariable(listofvariables[`${i}`]); //Tempororilay replace the variabel with its value. Will be reset when finished.
      console.log(
        "Replacing " + listofvariables[i] + " with " + variableList[i]
      );
      messageContent = chatMessage.replace(
        `${listofvariables[i]}`,
        variableList[i]
      ); //Replace the variabel with its value in the chatmessage.
      variableList[i] = false; //Reset its value
    } else {
      //element[i] = '';
      // console.log(listofvariables[`${i}`] + " is not in the command");
    }
  });

  console.log(messageContent + " is the final message");
}

function replaceVariable(variable) {
  //Checks the variable and replaces it with its new value.
  switch (variable) {
    case "$target":
      variableList[0] = "";

      break;
    case "$user":
      variableList[1] = "Mytho";

      break;
    case "$time":
      variableList[2] = getTime();

      break;
    case "$watchtime":
      break;
    case "$cmdcount":
      break;
    case "$game":
      break;

    default:
      break;
  }
}

function importCommands() {
  //Imports commands from the commands.JSON file.
 // var importedCommandsData = fs.readFileSync(`${path}data/commands.JSON`, "utf-8");
 // importedCommands = JSON.parse(importedCommandsData);
 // console.log(importedCommands);
}



function getTime() {
  var theTime = new Date().toTimeString();
  return theTime;
}

module.exports = { addCommand, editCommand, removeCommand, importCommands, checkCommand, syncCommands, updatePath}; //Send to the main file.
