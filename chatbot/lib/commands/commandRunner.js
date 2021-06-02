// This file handles commands. Runs, replace var, ,repeats, etc

// Holds all of the commands that are on cooldown
let cooldownArray = [];

/**
 * Checks if a command exists and runs it if it does.
 * @param {object} data An object full of data for the command to use.
 * @param {string} data.message The chat message that triggered the command
 * @param data.user The user that activated the command
 */
async function checkCommand(data) {
    let cleaned = data.message.replace(new RegExp("^[\!]+"), "").trim(); // Removes unwanted characters
    let command = cleaned.split(" ")[0].toLowerCase()
    try {
        let commandExists = await CommandHandle.findCommand(command);
        if (commandExists !== null) {
            try {
                let hasPerms = await permissionCheck(commandExists, data.user.username.toLowerCase())
                if (hasPerms == "ACCEPTED") {
                    runCommand({message: cleaned, command: commandExists, user: data.user}); // Run the command passing the message, command, and the user.
                } else if (hasPerms == "NEWUSER") {
                    checkCommand(data);
                } else { // They don't have permission
                    ChatMessages.filterMessage(hasPerms, "glimboi");
                    console.log(hasPerms)
                }
            } catch (e) {}
        } else {
            console.log(command + " is not a command");
        }
    } catch (error) {
        console.log("Error running command");
        console.log(error);
    }
}

/**
 * @async
 * @param {string} message The message that triggered the command
 * @param {object} command The command we are running
 * @param {string} user The user who activated the command.
 */
async function runCommand({message, command, user}) {
    if (command.cooldown && command.cooldown > 0) {
        cooldownArray.push(command.commandName);
        setTimeout(() => {
            for (let i = 0; i < cooldownArray.length; i++) {
                if (cooldownArray[i] == command.commandName) {
                    cooldownArray.splice(i, 1)
                }
            }
            console.log("now" + cooldownArray)
        }, command.cooldown * 60000);
    }
    // First we check for actions.
    if (command.actions) {
        for (let i = 0; i < command.actions.length; i++) {
            let action = new CommandHandle.ChatAction[`${command.actions[i].action}`](command.actions[i])
            await action.run({activation: message, user: user});
            console.log("Finished" + action.action)
        }
        return
    }

    if (command.message) {
        let action = new CommandHandle.ChatAction.ChatMessage({message: command.message})
        await action.run({activation: message, user: user});
    }

    if (command.sound && command.sound !== "null") {
        let action = new CommandHandle.ChatAction.Audio({source: command.sound})
        await action.run();
    }

    if (command.media && command.media !== "null") {
        let media = OBSHandle.getMediaByName(command.media);
        if (media !== null) {
            if (media.type.startsWith("image")) {
                let action = new CommandHandle.ImageGif(command.media)
                await action.run();
            } else if (media.type.startsWith("video")) {
                //OBSHandle.playVideo(media)
            }
        }
    }

  CommandHandle.addCommandCount(command.commandName); // Increments the command uses by one.
  if (command.cooldown) {
      cooldownArray.push(command.commandName)
  }
}

/**
 * Encures the user has permission to use the command
 * @param {object} command The command
 * @param {string} user The user who activated the command
 * @async
 */
async function permissionCheck(command, user) {
    console.log("before" + cooldownArray)
    if (command.cooldown && cooldownArray.includes(command.commandName)) {
        console.log(`Cooldown for ${command.commandName} is still active.`);
        return `${command.commandName} is still on cooldown.`
    }
    let userData = await UserHandle.findByUserName(user);
    if (userData !== "ADDUSER") {
        if (command.rank !== "Everyone") {
            console.log(`Command requires ${command.rank}, the user is ${userData.role}`);
            if (userData.role !== command.rank) {
                return "You don't have the required rank to use that command!"
            }
        }
        if (command.points !== 0) {
            if ((userData.points - command.points) < 0) {
                return `You do not have enough points to use this command. ${command.commandName}: ${command.points} | ${user}: ${userData.points}`
            } else {
                UserHandle.removePoints(user, command.points)
            }
        }
    } else {
        let newUser = await UserHandle.addUser(user, false);
        if (newUser !== "INVALIDUSER") {
            return "NEWUSER"
        } else { return "User Error" }
    }
    return "ACCEPTED"
}

module.exports = {checkCommand}