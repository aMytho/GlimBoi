var fs = require("fs"); //Reads files
const Datastore = require('nedb') //Reads commands

var path = "./";

let commandsDB;

//A normal command. 
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
 commandsDB = new Datastore({ filename: `${path}/data/commands.db`, autoload: true });
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

//Gets all the commands. used to show them on the table in the GUI.
async function getAll() {
  return new Promise(resolve => {
    commandsDB.find({}, function (err, docs) {
      console.log(docs)
      resolve(docs)
    })
  })
}


//The time of creation for the command
function getTime() {
  var theTime = new Date().toTimeString();
  return theTime;
}

module.exports = { addCommand, checkCommand, editCommand, getAll, removeCommand , updatePath}; //Send to the main file.
