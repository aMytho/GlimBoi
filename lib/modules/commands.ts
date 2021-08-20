// This file manages commands

let commandsDB:Nedb; //Database of commands.

const ChatAction:typeof import("../modules/commands/commandActionHandler") = require(appData[0] + "/modules/commands/commandActionHandler.js")
const CommandRunner:typeof import("../modules/commands/commandRunner") = require(appData[0] + "/modules/commands/commandRunner.js")

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
    commandsDB = new Datastore({ filename: `${updatedPath}/data/commands.db`, autoload: true });
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
function removeCommand(commandName: commandName) {
    commandsDB.remove({ commandName: commandName }, {}, function (err, numRemoved) {
        console.log(commandName + " was removed from the db");
    });
}

/**
 * Edits a command by searching the name. All values are passed (maybe...). Updates the commands upon completion.
 */
function editCommand({ commandName, actions, cooldown, uses, points, rank, repeat }:CommandContructor) {
    console.log(commandName, actions, cooldown, uses, points, rank, repeat)
    commandsDB.update({ commandName: commandName }, { $set: { actions: actions, cooldown: Number(cooldown), uses: Number(uses), points: Number(points), rank: rank, repeat: repeat } }, {}, function (err, numReplaced) {
        console.log("Updating " + commandName);
    });
}

/**
 * @param {string} command Name of command.
 * @returns A command
 * This technically does not need a promise, but all the functions that use it are meant to deal with promises. This will be fixed later
 */
function findCommand(command: commandName): Promise<null | CommandType> {
    return new Promise(resolve => {
        console.log("Searching for " + command);
        command = command.toLowerCase();
        commandsDB.findOne({ commandName: command }, function (err, doc) {
            if (doc !== null) {
                resolve(doc);
            } else {
                resolve(null);
            }
        });
    })
}

/**
 * Returns every command in the database.
 */
async function getAll(): Promise<CommandType[]> {
    return new Promise(resolve => {
        commandsDB.find({}, function (err: Error | null, docs: CommandType[]) {
            console.log(docs);
            resolve(docs);
        })
    })
}

/**
 * Loads a random repeatable command and activates it.
 */
function randomRepeatCommand() {
    commandsDB.find({ repeat: true }, function (err, docs:CommandType[]) {
        if (docs.length > 0) {
            let randomCommand = docs[Math.floor(Math.random() * docs.length)];
            console.log(randomCommand);
            CommandRunner.runCommand({ message: "!repeat", command: randomCommand, user: ApiHandle.getStreamerName() })
            ChatStats.resetUserMessageCounter()
        } else {
            console.log("No repeatable commands found");
        }
    });
}


/**
 * Increments the command uses by one. Updates the commands upon completion.
 * @param {string} command Name of the command
 */
function addCommandCount(command: commandName) {
    commandsDB.update({ commandName: command }, { $inc: { uses: 1 } }, {}, function (err, numReplaced) {
        err ? console.log(err) : null; // if error log it
    });
}

/**
 * Explains how to use commands in chat.
 */
function info() {
    ChatMessages.filterMessage("placeholder", "glimboi")
}

async function countCommands() {
    return new Promise(resolve => {
        commandsDB.count({}, function (err, count) {
            resolve(count);
        });
    })
}

export { addCommand, addCommandCount, addCommandFilter, ChatAction, CommandRunner,
countCommands, editCommand, findCommand, getAll, info,
randomRepeatCommand, removeCommand , updatePath};