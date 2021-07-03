// This file manages commands

let path = "./"; //Call updatePath(path) to set to the right path for the db
let commandsDB:Nedb; //Database of commands.
let commands:CommandType[] = []; //Array that contains all the commands. The bot reads this
let repeatableArray:RepeatableCommand[] = []; //Array of repeatable commands

const ChatAction = require(appData[0] + "/modules/commands/commandActionHandler.js")
const CommandRunner = require(appData[0] + "/modules/commands/commandRunner.js")

/**
 * @class Default command
 * @param {string} commandName The name of your command. Lowercase please!
 * @param {string} commandData The command response.
 * @param {number} uses The amount of times the command has been used.
 * @param {number} points The amount of points the command costs to run.
 * @param {string} rank The minimum rank to use this command
 * @param {null} special Not yet used. Null for now
 * @param {boolean} repeat Should the command repeat?
 * @param {string} sound Play a sound
 * @param {string} media Display an image or video
 * @param {array} actions What the command will do once activated
 */
class Command implements CommandType {
    commandName: string;
    uses: number
    points: number;
    cooldown: number;
    rank: rankName;
    repeat: boolean;
    actions: any
    constructor({commandName, uses, points, cooldown, rank, repeat, actions}:CommandContructor) {
        this.commandName = commandName; //The name of the command
        this.uses = uses; //Times the command has been used.
        this.points = points; //Points required per command
        this.cooldown = cooldown; // How long until it can be activated again?
        this.rank = rank; //Default is everyone
        this.repeat = repeat; // should this command be repeatable?
        this.actions = actions; // What the command will do once activated
    }
}


/**
 * Sets the correct filepath for the database
 * @param {string} updatedPath The file path before /data/commands.db
 */
function updatePath(updatedPath:string) {
  	path = updatedPath;
      // @ts-ignore
  	commandsDB = new Datastore({ filename: `${path}/data/commands.db`, autoload: true });
}


/**
 * Creates a new command. Reloads the current commands after completion.
 * @returns A command
 */
function addCommand(commandData:CommandContructor) {
    let newCommand = new Command(commandData);
    console.log(newCommand);
  	try {
    	//inserts a document as a command. Uses the command made above.
    	commandsDB.insert(newCommand, function(err, doc) {
    		console.log('Inserted command', doc.commandName, ' to the commands DB');
    		commands.push(newCommand);
    		if (newCommand.repeat == true) {
                // @ts-ignore
      			repeatableArray.push(newCommand)
    		}
  		});
  	} catch(e) {
    	console.log(e);
    	console.log("Failure to add Command. Ensure only one instance of the bot is running and check your commands.db file (in the data folder) for curruption.")
  	}
  	return newCommand;
}

/**
 * Filters a command from chat and if valid adds it
 * @param {string} commandName The name of the command
 * @param {string} commandData The data for the chatmessage
 * @param {string} type !command or !cmd
 */
function addCommandFilter(commandName:commandName, commandData:string, type: "!command" | "!cmd") {
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
  	commandData = commandData.trim()
  	if (commandData == null || commandData == undefined || commandData == "" || commandData == " ") {
    	ChatMessages.filterMessage("The command data was not valid. The syntax should look something like this: !cmd add !NAME RESPONSE . This may vary depending on the syntax used. ")
    	return
  	}
  	commandName = commandName.replace(new RegExp("^[\!]+"), "").trim();
  	console.log(commandName, commandData);
  	findCommand(commandName).then(data => {
    	if (data !== null) {
      		console.log(commandName + " already exists.")
      		ChatMessages.filterMessage(commandName + " already exists", "glimboi")
    	} else {
      		let newCMD = addCommand({commandName: commandName, uses: 0, points: 0, cooldown: 0, rank: "Everyone", repeat: false, actions: [new ChatAction.ChatMessage({message: commandData})]});
      		ChatMessages.filterMessage(commandName + " added!", "glimboi");
      		try {
        		addCommandTable({commandName: commandName, uses: 0, points: 0, rank: "Everyone", actions: newCMD.actions})
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
function removeCommand(commandName:commandName) {
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
 */
function editCommand({ commandName, actions, cooldown, uses, points, rank, repeat }:CommandContructor) {
    console.log(commandName, actions, cooldown, uses, points, rank, repeat)
    commandsDB.update({ commandName: commandName }, { $set: { actions: actions, cooldown: Number(cooldown), uses: Number(uses), points: Number(points), rank: rank, repeat: repeat } }, {}, function (err, numReplaced) {
        console.log("Updating " + commandName);
        for (let index = 0; index < commands.length; index++) {
            if (commandName == commands[index].commandName) {
                commands.splice(index, 1, { commandName: commandName, actions: actions, cooldown: Number(cooldown), uses: Number(uses), points: Number(points), rank: rank, repeat: repeat});
                let repeatExists = findRepeat(commandName);
                if (repeatExists == null && repeat == true) { // The command is gaining the repeat property. Add to array
                    console.log("Adding to repeat array.")
                    repeatableArray.push({ commandName: commandName, actions: actions, cooldown: 0, uses: Number(uses), points: Number(points), rank: rank, repeat: repeat})
                } else if (repeatExists !== null && repeatExists.command.repeat == true && repeat == false) { // The command is losing the repeat prop. Remove from array
                    console.log("Removing from repeat array")
                    removeRepeat(commandName)
                } else if (repeatExists !== null && repeatExists.command.repeat == repeat) { // The repeat is the same, we just need to edit other values.
                    console.log("Editing command in repeat array.")
                    repeatableArray.splice(repeatExists.index, 1, { commandName: commandName, actions: actions, cooldown: 0, uses: Number(uses), points: Number(points), rank: rank, repeat: repeat})
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
function findCommand(command:commandName): Promise<null | CommandType> {
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
function findRepeat(commandName:commandName) {
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
function removeRepeat(commandName:commandName) {
  	for (let i = 0; i < repeatableArray.length; i++) {
    	if (repeatableArray[i].commandName == commandName) {
      		repeatableArray.splice(i, 1);
      		break
    	}
  	}
}

/**
 * @async
 * Returns every command in the database. Also loads the repeat commands.
 */
async function getAll(): Promise<CommandType[]> {
  	return new Promise(resolve => {
    	commandsDB.find({}, function (err: Error | null, docs:CommandType[]) {
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
function loadRepeats(command:CommandType[]) {
  	repeatableArray = [] // reset the array, we don't want duplicates
  	let repeatCount = 0; //Counter of repeatable commands
  	for (let i = 0; i < command.length; i++) {
    	if (command[i] !== undefined && command[i].repeat == true) {
            command[i].cooldown = 0;
            // @ts-ignore
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
    let index = Math.floor(Math.random()*repeatableArray.length)
    console.log(repeatableArray[index]);
    if (repeatableArray[index] !== undefined) {
        CommandRunner.runCommand({message: "!repeat", command: repeatableArray[index], user: ApiHandle.getStreamerName()})
        globalThis.ChatStats.resetUserMessageCounter()
    }
}


/**
 * Increments the command uses by one. Updates the commands upon completion.
 * @param {string} command Name of the command
 */
function addCommandCount(command:commandName) {
  	commandsDB.update({ commandName: command }, { $inc: { uses: 1 } }, {}, function (err, numReplaced) {
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
 * Explains how to use commands in chat.
 */
function info() {
  	ChatMessages.filterMessage("placeholder", "glimboi")
}

export { addCommand, addCommandCount, addCommandFilter, ChatAction, CommandRunner, editCommand, findCommand, getAll, getCurrentCommands, getRepeats, info, randomRepeatCommand, removeCommand , updatePath}; //Send to the main file.
