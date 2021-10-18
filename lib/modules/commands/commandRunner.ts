// This file handles commands. Runs, replace vars, repeats, etc

// Holds all of the commands that are on cooldown
let cooldownArray:commandName[] = [];

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
                let hasPerms = await permissionCheck(commandExists, data.user.username.toLowerCase());
                if (hasPerms == "ACCEPTED") {
                    await runCommand({ message: cleaned, command: commandExists, user: data.user }); // Run the command passing the message, command, and the user.
                    if (commandExists.shouldDelete) {
                        setTimeout(async () => {
                            let messageDeleted = await ApiHandle.deleteMessage(data.id);
                            if (messageDeleted) {
                                LogHandle.logEvent({ event: "Delete Message", users: ["Glimboi", data.user.username], data: { messageID: data.id } })
                                adjustMessageState(data.id, "deleted");
                            }
                        }, 400);
                    }
                } else if (hasPerms == "NEWUSER") {
                    checkCommand(data);
                } else { // They don't have permission
                    ChatMessages.filterMessage(hasPerms, "glimboi");
                    console.log(hasPerms);
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
    // If a cooldown exists we add it to the cooldown array and remove it with a settimeout
    if (command.cooldown && command.cooldown > 0) {
        cooldownArray.push(command.commandName);
        setTimeout(() => {
            for (let i = 0; i < cooldownArray.length; i++) {
                if (cooldownArray[i] == command.commandName) {
                    cooldownArray.splice(i, 1)
                }
            }
        }, command.cooldown * 60000);
    }

    // Increments the command uses by one.
    CommandHandle.addCommandCount(command.commandName);

    // First we check for actions.
    if (command.actions) {
        let varsGenerated = []
        for (let i = 0; i < command.actions.length; i++) {
            let action = new CommandHandle.ChatAction[`${command.actions[i].action}`](command.actions[i])
            let actionActivated = await action.run({activation: message, user: user});
            if (actionActivated) {
                actionActivated.forEach(element => {
                    varsGenerated.push(element)
                });
            }
        }
        CommandHandle.ChatAction.ActionResources.removeVariables(varsGenerated);
        return
    }

    // If legacy we create a ChatMessage action from the message property
    if (command.message) {
        let action = new CommandHandle.ChatAction.ChatMessage({message: command.message})
        await action.run({activation: message, user: user});
    }

    // If legacy we create a Audio action from the sound property
    if (command.sound && command.sound !== "null") {
        let action = new CommandHandle.ChatAction.Audio({source: command.sound})
        await action.run();
    }

    // If legacy we create a ImageGif or Video action from the media property
    if (command.media && command.media !== "null") {
        let media = await MediaHandle.getMediaByName(command.media);
        if (media !== null) {
            if (media.type.startsWith("image")) {
                let action = new CommandHandle.ChatAction.ImageGif({source: command.media})
                await action.run();
            } else if (media.type.startsWith("video")) {
                let action = new CommandHandle.ChatAction.Video({source: command.media});
                await action.run()
            }
        }
    }
}

/**
 * Encures the user has permission to use the command
 * @param {object} command The command
 * @param {string} user The user who activated the command
 * @async
 */
async function permissionCheck(command:CommandType, user:userName) {
    if (command.cooldown && cooldownArray.includes(command.commandName)) {
        console.log(`Cooldown for ${command.commandName} is still active.`);
        return CacheStore.get("commandCooldownMessage", false) || `${command.commandName} is still on cooldown.`
    }
    let userData = await UserHandle.findByUserName(user);
    if (userData !== "ADDUSER") {
        if (command.rank !== "Everyone") {
            console.log(`Command requires ${command.rank}, the user is ${userData.role}`);
            let commandRankData = await RankHandle.getRankPerms(command.rank);
            let userRankData = await RankHandle.getRankPerms(userData.role);
            if (commandRankData.rankTier > userRankData.rankTier) {
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

export {checkCommand, runCommand}