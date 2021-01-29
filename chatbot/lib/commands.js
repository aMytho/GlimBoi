const Datastore = require('nedb'); //Reads commands

var path = "./";
let commandsDB;
var commands = []; //Array that contains all the commands. The bot reads this 
var cooldown = 0;
var startCD, timeCD;
var repeatableArray = [], repeatDelay = 0;

//A normal command. 
class Command {
  constructor(
    commandName,
    arguements,
    commandData,
    uses,
    points,
    rank,
    special,
    repeat
  ) {
    this.commandName = commandName; //The name of the command
    this.arguements = arguements; //Paramaters to send to the command
    this.message = commandData; // No explanation here
    this.uses = uses; //Times the command has been used.
    this.points = points; //Points required per command
    this.rank = rank; //Default is everyone
    this.special = special; //oooo
    this.repeat = repeat; // should this command be repeatable?
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


//Updates the file path. Electron and the non electron build use different URLS.
function updatePath(GUI) {
  console.log("path is " + GUI);
  path = GUI;
 commandsDB = new Datastore({ filename: `${path}/data/commands.db`, autoload: true });
}


//Adds a command
function addCommand(commandName, arguements, commandData, uses, points, rank, special, repeat) {
  var newCommand = new Command(commandName, arguements, commandData, Number(uses), Number(points), rank, special, repeat);
  try {
    //inserts a document as a command. Uses the command made above.
    commandsDB.insert(newCommand, function(err, doc) {
    console.log('Inserted', doc.commandName, 'with ID', doc._id);
    getAll()
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
    console.log(commandName + " was removed from the db");
    getAll()
  });
}

//Edits a command
function editCommand(commandName, arguements, commandData, commandUses, commandPoints, commandRank, special, repeat) {
  console.log(commandName, arguements, commandData, commandUses, commandPoints, commandRank, special, repeat)
  commandsDB.update({ commandName: commandName }, { $set: {arguements : arguements, message: commandData, uses: Number(commandUses), points: Number(commandPoints), rank: commandRank, special: special, repeat: repeat} }, {}, function (err, numReplaced) {
    console.log("Replacing " + commandName);
    getAll()
});
}

async function findCommand(command) {
  return new Promise(resolve => {
    commandsDB.find({commandName: command}, function (err, docs) {
      console.log(docs)
      resolve(docs[0]) //
    })
  })
}

//Checks if a command exists and runs it if it does.
function checkCommand(data) {
  var message = data.message.split(" "); //splits by space
  message[0] = message[0].substring(1)
  console.log(message)
  timeCD = new Date();
  var CD = timeCD - startCD
  console.log(CD)
  if (CD < cooldown) {} else {
  try {
    var commandExists = false;
    for (let index = 0; index < commands.length; index++) {
      try {
        if (commands[index].commandName == message[0]) { 
        commandExists = true
        runCommand(message, index, data.user);
        break
        }
      } catch(e) {}
    }
    if (commandExists == false) { //if the command does exist...
      console.log(message[0] + " is not a command");
    }
  
  } catch (error) {
    console.log("Error running command");
    console.log(error);
  }
}
}

//Runs the command
async function runCommand(arguements, index, user) {
  console.log("Running !" + arguements[0]);
  var chatMessage = commands[index].message; //The command response
    //Check the command to see if it has any variables.
    variableList[0] = chatMessage.includes("$target");
    variableList[1] = chatMessage.includes("$user");
    variableList[2] = chatMessage.includes("$time");
    variableList[3] = chatMessage.includes("$watchtime");
    variableList[4] = chatMessage.includes("$cmdcount");
    variableList[5] = chatMessage.includes("$game");
  //We check if the command has variables against the variable list.
  for (let i = 0; i < variableList.length; i++) {
    //For every variable we check if it is in the messageContent
    if (variableList[`${i}`] == true && variableList[`${i}`] !== undefined) {
      //If the var is in the string
      console.log(listofvariables[`${i}`] + " is in the command.");
      await replaceVariable(listofvariables[`${i}`], arguements, user) //Tempororilay replace the variable with its value. Will be reset when finished.
        console.log("Replacing " + listofvariables[i] + " with " + variableList[i]);
        chatMessage = chatMessage.replaceAll(
          `${listofvariables[i]}`, //Replace this
           variableList[i] // With this
        ); //Replace the variabel with its value in the chatmessage.
        variableList[i] = false; //Reset its value
      }
    }
    console.log(chatMessage + " is the final message");
    ChatHandle.sendMessage(chatMessage);
    addCommandCount(arguements[0]);
    startCD = new Date();
  }
    

 


async function replaceVariable(variable, arguements, user) {
  //Checks the variable and replaces it with its new value.
  console.log(user)
  switch (variable) {
    case "$target": //The first word after the command
      variableList[0] = arguements[1];

      break;
    case "$user": //The user who said the message. 
     variableList[1] = user.username

      break;
    case "$time": //Current time
      variableList[2] = getTime();

      break;
    case "$watchtime":
      break;
    case "$cmdcount":
      var count = await findCommand(arguements[0])
      variableList[4] = count.uses
      break;
    case "$game":
      user = await ApiHandle.getUserID(user.username)
      variableList[5] = user
      
      break;

    default:
      break;
  }
}

//Gets all the commands. used to show them on the table in the GUI. Also used for acutal command input. 
//Performance wise it may not seem smart but its speed is crazy so its ok for now.
//eventually may import at start and add to a js array instead.
async function getAll() {
  return new Promise(resolve => {
    commandsDB.find({}, function (err, docs) {
      console.log(docs)
      commands = docs //The bot knows all the commands now. This is the bot, not the UI
      resolve(docs) //UI probably knows after this
      loadRepeats(docs)
    })
  })
}

function loadRepeats(command) {
  repeatableArray = [] // reset the array, we don't want duplicates
  var repeatCount = 0
  for (let i = 0; i < command.length; i++) {
    if (command[i] !== undefined && command[i].repeat == true) {
      repeatableArray.push(command[i]) // adds it to the array
      repeatCount++
    }
  }
  console.log("Added " + repeatCount + " repeatable commands");
  console.log(repeatableArray);
}

// picks a random repeatable command
function randomRepeatCommand() {
  var index = Math.floor(Math.random()*repeatableArray.length)
  console.log(repeatableArray[index]);
  if (repeatableArray[index] !== undefined) {
  console.log(repeatableArray[index].message);
  checkCommand({message: `!${repeatableArray[index].commandName}`, user: "GlimBoi"})
  ChatHandle.resetUserMessageCounter()
  }
}

//The time of creation for the command
function getTime() {
  var theTime = new Date().toTimeString();
  return theTime;
}

// Increases the command uses by one. 
async function addCommandCount(command) {
  commandsDB.update({ commandName: command }, { $inc: {uses: 1} }, {}, function (err, numReplaced) {
    console.log("Updating uses of " + command);
    err ? console.log(err) : null; // if error log it
    getAll()
});
}

function cooldownChange(cd) {
  cooldown = cd*1000;
  console.log(cooldown)
}

module.exports = { addCommand, checkCommand, cooldownChange, editCommand, getAll, randomRepeatCommand, removeCommand , updatePath}; //Send to the main file.
