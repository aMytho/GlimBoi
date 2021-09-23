// This file manages commands

let commandsDB:Nedb; //Database of commands.

const ChatAction:typeof import("../modules/commands/commandActionHandler") = require(appData[0] + "/modules/commands/commandActionHandler.js");
const CommandRunner:typeof import("../modules/commands/commandRunner") = require(appData[0] + "/modules/commands/commandRunner.js");

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
    shouldDelete: boolean
    actions: ChatAction[]; //What the command will do once activated
    constructor({commandName, uses, points, cooldown, rank, repeat, actions, shouldDelete}:CommandContructor) {
        this.commandName = commandName; //The name of the command
        this.uses = uses; //Times the command has been used.
        this.points = points; //Points required per command
        this.cooldown = cooldown; // How long until it can be activated again?
        this.rank = rank; //Default is everyone
        this.repeat = repeat; // should this command be repeatable?
        this.shouldDelete = shouldDelete; // Should the command be deleted after use? (!cmd)
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
function addCommand(commandData: CommandContructor) {
    let newCommand = new Command(commandData);
    console.log(newCommand);
    try {
        //inserts a document as a command. Uses the command made above.
        commandsDB.insert(newCommand, function (err, doc) {
            console.log('Inserted command', doc.commandName, ' to the commands DB');
        });
    } catch (e) {
        console.log(e);
        console.log("Failure to add Command. ^^^")
    }
    return newCommand;
}

/**
 * Removes a command from the database. Reloads the current commands upon completion
 * @param {string} commandName Lowercase version of the command name.
 */
function removeCommand(commandName: commandName) {
    commandsDB.remove({ commandName: commandName }, {}, function () {
        console.log(commandName + " was removed from the db");
    });
}

/**
 * Edits a command by searching the name. All values are passed (maybe...). Updates the commands upon completion.
 */
function editCommand({ commandName, actions, cooldown, uses, points, rank, repeat }:CommandContructor) {
    console.log(commandName, actions, cooldown, uses, points, rank, repeat)
    commandsDB.update({ commandName: commandName }, { $set: {
        actions: actions, cooldown: Number(cooldown), uses: Number(uses),
        points: Number(points), rank: rank, repeat: repeat } }, {}, function (err, numReplaced) {
        console.log("Updating " + commandName);
    });
}

/**
 * Returns a command (promise). Null if not found
 * @param {string} command Name of command.
 * @returns A command
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
    ChatMessages.filterMessage(`Glimboi command docs -> https://glimboi.com/docs/intro/commands/`, "glimboi")
}

/**
 * Counts how many commands are in the database.
 * @returns
 */
async function countCommands(): Promise<number> {
    return new Promise(resolve => {
        commandsDB.count({}, function (err, count) {
            resolve(count);
        });
    })
}

export { addCommand, addCommandCount, ChatAction, CommandRunner,
countCommands, editCommand, findCommand, getAll, info,
randomRepeatCommand, removeCommand , updatePath};