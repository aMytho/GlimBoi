var path = "./"; //Default path, most likely wrong. Call updatePath(path) to set to the right path.
let commandsDB; //Database of commands.
var commands = []; //Array that contains all the commands. The bot reads this
var cooldown = 0; //Default cooldown time for commands
var startCD = new Date(), timeCD; //When a command is activated to the next command. Subtract now from then.
var repeatableArray = []; //Array of repeatable commands

/**
 * @class Default command
 * @param {string} commandName The name of your command. Lowercase please!
 * @param {null} arguements null for now
 * @param {string} commandData The command response.
 * @param {number} uses The amount of times the command has been used.
 * @param {number} points The amount of points the command costs to run.
 * @param {string} rank The minimum rank to use this command
 * @param {null} special Not yet used. Null for now
 * @param {boolean} repeat Should the command repeat?
 */
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
//This array contains all possible variables for commands. The order is important!!!
//If you add a new var it must be at the bottom and you must link it is the replace variable function in the SAME ORDER!
var listofvariables = [
  "$target", // The word after the command. ex !so Mytho (Mytho would be the target)
  "$user", //The user who activated the command.
  "$time", // The current time.
  "$watchtime", // unused.
  "$cmdcount", // The amount of times a command has been used.
  "$game", // unused
  "$advice", // Random advice. View API.js
  "$dadjoke" // Random dad joke. View API.js
];


/**
 * Sets the correct filepath for the database
 * @param {string} GUI The file path before /data/commands.db
 */
function updatePath(GUI) {
  console.log("path is " + GUI);
  path = GUI;
  commandsDB = new Datastore({ filename: `${path}/data/commands.db`, autoload: true });
}


/**
 * Creates a new command. Reloads the current commands after completion.
 * @param {string} commandName The name of your command. Lowercase please!
 * @param {null} arguements null for now
 * @param {string} commandData The command response.
 * @param {number} uses The amount of times the command has been used.
 * @param {number} points The amount of points the command costs to run.
 * @param {string} rank The minimum rank to use this command
 * @param {null} special Not yet used. Null for now
 * @param {boolean} repeat Should the command repeat?
 * @returns A command
 */
function addCommand(commandName, arguements, commandData, uses, points, rank, special, repeat) {
  var newCommand = new Command(commandName, arguements, commandData, Number(uses), Number(points), rank, special, repeat);
  try {
    //inserts a document as a command. Uses the command made above.
    commandsDB.insert(newCommand, function(err, doc) {
    console.log('Inserted', doc.commandName, 'with ID', doc._id);
    commands.push(newCommand);
    if (repeat == true) {
      repeatableArray.push(newCommand)
    }
  });
  } catch(e) {
    console.log(e);
    console.log("Failure to add Command. Ensure only one instance of the bot is running and check your commands.db file (in the data folder) for curruption.")
  }
  return newCommand;
}

function addCommandFilter(commandName, arguements, commandData, type) {
  commandName = commandName.toLowerCase()
  if (commandName == null || commandName == undefined || commandName == "" || commandName == " ") {
    ChatMessages.filterMessage("The command name was not valid. The syntax should look something like this: !cmd add !NAME RESPONSE . This may vary depending on the syntax used.", "glimboi" )
    return
  }
  if (type == "!command") {
    commandData = commandData.substring(12 + commandName.length + 2)
    console.log(commandData)
  } else {
    commandData = commandData.substring(8 + commandName.length + 2)
    console.log(commandData)
  }
  commandData = commandData.substring()
  if (commandData == null || commandData == undefined || commandData == "" || commandData == " ") {
    ChatMessages.filterMessage("The command data was not valid. The syntax should look something like this: !cmd add !NAME RESPONSE . This may vary depending on the syntax used. ")
    return
  }
  if (commandName.startsWith("!")) {
    commandName = commandName.substring(1)
  }
  console.log(commandName, commandData);
  findCommand(commandName).then(data => {
    if (data !== null) {
      console.log(commandName + " already exists.")
      ChatMessages.filterMessage(commandName + " already exists", "glimboi")
    } else {
      addCommand(commandName, null, commandData, 0, 0, "Everyone", null, false);
      ChatMessages.filterMessage(commandName + " added!", "glimboi");
      try {
        addCommandTable(commandName, commandData, 0, 0, "Everyone")
      } catch(e) {
        console.log(e)
      }
    }
  })

}



/**
 * Removes a command from the database. Reloads the current commands upon completion
 * @param {string} commandName Lowercase version of the command name.
 */
function removeCommand(commandName) {
  commandsDB.remove({ commandName: commandName }, {}, function (err, numRemoved) {
    console.log(commandName + " was removed from the db");
    for (let index = 0; index < commands.length; index++) {
      if (commandName == commands[index].commandName) {
        if (commands[index].repeat == true) {
          removeRepeat(commandName)
        }
        commands.splice(index, 1);
        break;
      }
    }
  });
}

/**
 * Edits a command by searching the name. All values are passed (maybe...). Updates the commands upon completion.
 * @param {string} commandName The name of your command. Lowercase please!
 * @param {null} arguements null for now
 * @param {string} commandData The command response.
 * @param {number} uses The amount of times the command has been used.
 * @param {number} points The amount of points the command costs to run.
 * @param {string} rank The minimum rank to use this command
 * @param {null} special Not yet used. Null for now
 * @param {boolean} repeat Should the command repeat?
 */
function editCommand(commandName, arguements, commandData, commandUses, commandPoints, commandRank, special, repeat) {
  console.log(commandName, arguements, commandData, commandUses, commandPoints, commandRank, special, repeat)
  commandsDB.update({ commandName: commandName }, { $set: { arguements: arguements, message: commandData, uses: Number(commandUses), points: Number(commandPoints), rank: commandRank, special: special, repeat: repeat } }, {}, function (err, numReplaced) {
    console.log("Updating " + commandName);
    for (let index = 0; index < commands.length; index++) {
      if (commandName == commands[index].commandName) {
        commands.splice(index, 1, { commandName: commandName, arguements: arguements, message: commandData, uses: Number(commandUses), points: Number(commandPoints), rank: commandRank, special: special, repeat: repeat });
        var repeatExists = findRepeat(commandName);
        if (repeatExists == null && repeat == true) { // The command is gaining the repeat property. Add to array
          console.log("Adding to repeat array.")
          repeatableArray.push({ commandName: commandName, arguements: arguements, message: commandData, uses: Number(commandUses), points: Number(commandPoints), rank: commandRank, special: special, repeat: repeat })
        } else if (repeatExists !== null && repeatExists.command.repeat == true && repeat == false) { // The command is losing the repeat prop. Remove from array
          console.log("Removing from repeat array")
          removeRepeat(commandName)
        } else if (repeatExists !== null && repeatExists.command.repeat == repeat) { // The repeat is the same, we just need to edit other values.
          console.log("Editing command in repeat array.")
          repeatableArray.splice(repeatExists.index, 1, { commandName: commandName, arguements: arguements, message: commandData, uses: Number(commandUses), points: Number(commandPoints), rank: commandRank, special: special, repeat: repeat })
        }
        break;
      }
    }
  });
}

/**
 * @param {string} command Name of command.
 * @returns A command
 * This technically does not need a promise, but all the functions that use it are meant to deal with promises. This will be fixed later
 */
function findCommand(command) {
  return new Promise(resolve => {
    console.log("Searching for " + command);
    command = command.toLowerCase()
    for (let index = 0; index < commands.length; index++) {
      if (command == commands[index].commandName) {
        resolve(commands[index]);
        break;
      }
    }
    resolve(null)
  })
}

/**
 * Returns the repeatable command and null if none exists.
 * @param {string} commandName
 * @returns
 */
function findRepeat(commandName) {
  for (let i = 0; i < repeatableArray.length; i++) {
    if (repeatableArray[i].commandName == commandName) {
      return { command: repeatableArray[i], index: i };
    }
  }
  return null
}

/**
 * Removes the command from the repeat array.
 * @param {string} commandName
 */
function removeRepeat(commandName) {
  for (let i = 0; i < repeatableArray.length; i++) {
    if (repeatableArray[i].commandName == commandName) {
      repeatableArray.splice(i, 1);
      break
    }
  }
}

/**
 * Checks if a command exists and runs it if it does.
 * @param {object} data An object full of data for the command to use.
 * @param data.message The chat message that triggered the command
 * @param data.user The user that activated the command
 */
function checkCommand(data) {
  var message = data.message.split(" "); //splits by space
  message[0] = message[0].substring(1) // The command without the !
  console.log(message)
  timeCD = new Date();
  var CD = timeCD - startCD // check the time since the last command was activated. (cooldown check)
  if (CD < cooldown) {/*  if not enough time has passed do nothing*/} else { // We are past the cooldown, command time!
  try {
    var commandExists = false; // We assume the command does not exist.
    for (let index = 0; index < commands.length && commandExists == false; index++) { // Runs a loop to search for the command in the commands array
      try {
        if (commands[index].commandName == message[0]) { // We found the command!
        commandExists = true // We log this. If it were false we would log it to the console.
        console.log(commands[index]);
        permissionCheck(commands[index], data.user.username.toLowerCase()).then(value => {
          if (value == "ACCEPTED") {
            runCommand(message, index, data.user); // Run the command passing the message, index (used to get the right cmd), and the user.
          } else { // They don't have permission, we log this to chat.
            ChatMessages.filterMessage(value, "glimboi");
            console.log(value)
          }
        })
        break // stop the loop.
        }
      } catch(e) {}
    }
    if (commandExists == false) { //The command was not found. We log it to the console.
      console.log(message[0] + " is not a command");
    }

  } catch (error) {
    console.log("Error running command");
    console.log(error);
  }
}
}

/**
 * Encures the user has permission to use the command
 * @param {object} command The command
 * @param {string} user The user who activated the command
 * @async
 */
async function permissionCheck(command, user) {
  return new Promise(resolve => {
    if (command.points !== 0 ) {
      UserHandle.findByUserName(user).then(data => {
        if (data == "ADDUSER") {
          resolve("This command requires points to use. You must be a user to have points.")
          return
        } else if ((data[0].points - command.points) < 0) {
          resolve(`You do not have enough points to use this command. ${command.commandName}: ${command.points} | ${user}: ${data[0].points}`);
          return
        } else {
          UserHandle.removePoints(user, command.points)
          resolve("ACCEPTED")
        }
      })
    } else {
      resolve("ACCEPTED")
    }
    /*
    if (commands.rank == 0) {

    }
    */
  })
}

/**
 * @async
 * @param {array} arguements Each array value is a word in the chat message.
 * @param {number} index The index to search for in the commands array.
 * @param {string} user The user who activated the command.
 */
async function runCommand(arguements, index, user) {
  console.log("Running !" + arguements[0]);
  var chatMessage = commands[index].message; //The command response
    //Check the command to see if it has any variables. variableList[i] is set to true if the var exists.
    variableList[0] = chatMessage.includes("$target");
    variableList[1] = chatMessage.includes("$user");
    variableList[2] = chatMessage.includes("$time");
    variableList[3] = chatMessage.includes("$watchtime");
    variableList[4] = chatMessage.includes("$cmdcount");
    variableList[5] = chatMessage.includes("$game");
    variableList[6] = chatMessage.includes("$advice");
    variableList[7] = chatMessage.includes("$dadjoke");
  //We check if the command has variables against the variable list.
  for (let i = 0; i < variableList.length; i++) {
    //For every variable we check if it is in the chatMessage
    if (variableList[`${i}`] == true && variableList[`${i}`] !== undefined) {
      //If the variable is in the string...
      console.log(listofvariables[`${i}`] + " is in the command.");
      await replaceVariable(listofvariables[`${i}`], arguements, user) //Temporilay replace the variable with its value. Will be reset when finished.
        console.log("Replacing " + listofvariables[i] + " with " + variableList[i]);
        chatMessage = chatMessage.replaceAll(
          `${listofvariables[i]}`, //Replace this (ex. $dadjoke)
           variableList[i] // With this (ex. Whats brown and sticky? A stick!)
        ); //Replace the variable with its value in the chatmessage.
        variableList[i] = false; //Reset its value on the variable list.
      }
    }
    console.log(chatMessage + " is the final message");
    ChatMessages.filterMessage(chatMessage, "glimboi"); // Sends the message to the chat.
    addCommandCount(arguements[0]); // Increments the command uses by one.
    startCD = new Date(); // We save the time, use to determine if enough time has passed (cooldowns)
  }


/**
 *
 * @param {string} variable The command variable ex $user, $dadjoke, $target,etc
 * @param {array} arguements An array of each word in the chat message
 * @param {string} user The user who activated the command
 */
async function replaceVariable(variable, arguements, user) {
  //Checks the variablelist and replaces it with its new value.
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
      var watchTime = await UserHandle.findByUserName(user.username.toLowerCase())
      if (watchTime == "ADDUSER") {variableList[3] = "(No user found)"} else {
      variableList[3] = watchTime[0].watchTime
      }
      break;
    case "$cmdcount":
      var count = await findCommand(arguements[0])
      variableList[4] = count.uses
      break;
    case "$game":
      user = await ApiHandle.getUserID(user.username)
      variableList[5] = user
      break;
    case "$advice":
      var advice = await ApiHandle.getAdvice().catch(reason => variableList[6] = 'Advice Error');
      variableList[6] = advice
      break;
    case "$dadjoke":
      var joke = await ApiHandle.getDadJoke().catch(reason => variableList[7] = 'Joke Error');
      variableList[7] = joke
      break;
    default:
      break;
  }
}


/**
 * @async
 * Returns every command in the database. Also loads the repeat commands.
 */
async function getAll() {
  return new Promise(resolve => {
    commandsDB.find({}, function (err, docs) {
      console.log(docs)
      commands = docs //The bot knows all the commands now. This is the bot, not the UI
      resolve(docs) //UI probably knows after this
      loadRepeats(docs) // load the repeat commands
    })
  })
}

// Self explanatory. This contains all the commands
function getCurrentCommands() {
  return commands
}

// Returns all the repeatable data
function getRepeats() {
  return repeatableArray
}

/**
 * Loads all the repeat commands. Pushes them to the repeatableArray
 * @param {array} command Array of all commands
 */
function loadRepeats(command) {
  repeatableArray = [] // reset the array, we don't want duplicates
  var repeatCount = 0; //Counter of repeatable commands
  for (let i = 0; i < command.length; i++) {
    if (command[i] !== undefined && command[i].repeat == true) {
      repeatableArray.push(command[i]) // adds it to the array
      repeatCount++ // adds 1 to the counter
    }
  }
  console.log("Added " + repeatCount + " repeatable commands");
  console.log(repeatableArray);
}

/**
 * Loads a random repeatable command and activates it.
 */
function randomRepeatCommand() {
  var index = Math.floor(Math.random()*repeatableArray.length)
  console.log(repeatableArray[index]);
  if (repeatableArray[index] !== undefined) {
  console.log(repeatableArray[index].message);
  //checkCommand({message: `!${repeatableArray[index].commandName}`, user: "GlimBoi"})
  ChatMessages.filterMessage(`${repeatableArray[index].message}`, "glimboi")
  ChatStats.resetUserMessageCounter()
  }
}

/**
 * Command creation time.
 * @returns The time
 */
function getTime() {
  var theTime = new Date().toTimeString();
  return theTime;
}

/**
 * Increments the command uses by one. Updates the commands upon completion.
 * @param {string} command Name of the command
 */
function addCommandCount(command) {
  commandsDB.update({ commandName: command }, { $inc: { uses: 1 } }, {}, function (err, numReplaced) {
    console.log("Updating uses of " + command);
    err ? console.log(err) : null; // if error log it
    for (let index = 0; index < commands.length; index++) {
      if (command == commands[index].commandName) {
        commands[index].uses++
        break;
      }
    }
  });
}

/**
 * Sets the cooldown timer.
 * @param {number} cd How many seconds should the cooldown be?
 */
function cooldownChange(cd) {
  cooldown = cd*1000;
  console.log("Command cooldown is " + cooldown)
}

/**
 * Explains how to use commands in chat.
 */
function info() {
  ChatMessages.filterMessage("placeholder", "glimboi")
}

module.exports = { addCommand, addCommandFilter, checkCommand, cooldownChange, editCommand, findCommand, getAll, getCurrentCommands, getRepeats, info, randomRepeatCommand, removeCommand , updatePath}; //Send to the main file.
