// This file manages commands

import Nedb from "@seald-io/nedb";

let commandsDB:Nedb<Command>; //Database of commands.

const ChatAction:typeof import("../modules/commands/commandActionHandler") = require(appData[0] + "/modules/commands/commandActionHandler.js");
const CommandRunner:typeof import("../modules/commands/commandRunner") = require(appData[0] + "/modules/commands/commandRunner.js");
const TriggerHelper:typeof import("./commands/triggerHelper") = require(appData[0] + "/modules/commands/triggerHelper.js");

/**
 * A command
 * @class
 */
class Command implements CommandType {
    commandName: string;
    triggers: TriggerStructure[]; //Triggers for the command
    uses: number
    points: number;
    cooldown: number;
    rank: rankName;
    repeat: boolean;
    shouldDelete: boolean;
    actions: ChatAction[];
    disabled: boolean;
    constructor({commandName, uses, points, cooldown, rank, repeat, actions, shouldDelete, disabled}:CommandContructor) {
        this.commandName = commandName; //The name of the command
        this.uses = uses; //Times the command has been used.
        this.points = points; //Points required per command
        this.cooldown = cooldown; // How long until it can be activated again?
        this.rank = rank; //Default is everyone
        this.repeat = repeat; // should this command be repeatable?
        this.shouldDelete = shouldDelete; // Should the command be deleted after use? (!cmd)
        this.actions = actions; // What the command will do once activated
        this.disabled = disabled; // Can the commaand be activated?
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
 * Creates a new command.
 * @returns A command
 */
function addCommand(commandData: CommandType) {
    let newCommand = new Command(commandData);
    console.log(newCommand);
    //inserts a document as a command.
    commandsDB.insert(newCommand, function (err, doc) {
        if (err) {
            console.log(err);
            return
        }
        console.log('Inserted command', doc.commandName, ' to the commands DB');
    });
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
function editCommand({ commandName, actions, cooldown, uses, points, rank, repeat, shouldDelete, disabled }:CommandContructor) {
    console.log(commandName, actions, cooldown, uses, points, rank, repeat, disabled)
    commandsDB.update({ commandName: commandName }, { $set: {
        actions: actions, cooldown: Number(cooldown), uses: Number(uses), disabled: disabled,
        points: Number(points), rank: rank, repeat: repeat, shouldDelete: shouldDelete } }, {}, function (err, numReplaced) {
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
 * Returns a list of commands that match the trigger. Only the trigger requested is in the trigger list.
 * @param trigger The trigger to search for
 */
async function findByTrigger(trigger: CommandTrigger): Promise<CommandType[]> {
    return new Promise(resolve => {
        commandsDB.find({ triggers: { $elemMatch: { trigger: trigger } } }, function (err: any, docs: CommandType[]) {
            docs.map(cmd => {
                cmd.triggers = cmd.triggers.filter(trig => trig.trigger === trigger);
                return cmd;
            })
            resolve(docs);
        });
    })
}

/**
 * Returns every command in the database.
 */
function getAll(): Promise<CommandType[]> {
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
 * Counts how many commands are in the database.
 * @returns
 */
function countCommands(): Promise<number> {
    return new Promise(resolve => {
        commandsDB.count({}, function (err, count) {
            resolve(count);
        });
    })
}

/**
 * Adds the default chatmessage trigger to a command.
 * @param name The name of the command to edit
 */
function addDefaultTrigger(name:string) {
    return new Promise(resolve => {
        commandsDB.update({commandName: name}, {
            $set: {triggers: [{trigger: "ChatMessage", constraints: {startsWith: name}}]}
        }, {}, function (err, numReplaced) {
            resolve(numReplaced);
        });
    })
}

export { addCommand, addCommandCount, addDefaultTrigger, ChatAction, CommandRunner,
countCommands, editCommand, findByTrigger, findCommand, getAll,
randomRepeatCommand, removeCommand, TriggerHelper, updatePath};