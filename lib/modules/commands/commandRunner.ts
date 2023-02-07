// This file handles commands. Runs, replace vars, repeats, etc

// Holds all of the commands that are on cooldown
let cooldownArray:commandName[] = [];

/**
 * Checks if a command exists and runs it if it does.
 */
async function checkCommand(command: CommandType, context: TriggerContext) {
    try {
        // Bypass activated, likely manual trigger. Skip permission check and run
        if (context.bypassPermissions) {
            setupRuntime(command, context);
        } else {
            // Needs a permission check
            let hasPerms = await permissionCheck(command, context.user.username.toLowerCase());
            // All good!
            if (hasPerms == "ACCEPTED") {
                setupRuntime(command, context);
                // New user, wait till usr creation and recheck
            } else if (hasPerms == "NEWUSER") {
                checkCommand(command, context);
            } else { // They don't have permission
                if (hasPerms != "NOMESSAGE") {
                    ChatMessages.sendMessage(hasPerms);
                }
                console.log(`Command permission check failed: ${hasPerms}`);
            }
        }
    } catch (e) {
        console.log("Command Error: " + e);
    }
}

/**
 * Inject the variables, run the command, cleanup, and withdraw variables for the command
 * @param command The command to run
 * @param context The context of the command
 */
async function setupRuntime(command: CommandType, context: TriggerContext) {
    // Check if any variables need to be created from the context
    if (context.variables) injectVariables(context.variables);
    // Run the command
    await runCommand({ message: context.message, command: command, user: context.user });
    // Cleanup
    postCommandRun(command, context);
    // Remove generated variables (if any)
    if (context.variables) withdrawVariables(context.variables);
}

/**
 * @param {string} message The message that triggered the command
 * @param {object} command The command we are running
 * @param {string} user The user who activated the command.
 */
async function runCommand({message, command, user}) {
    // First we check for actions.
    if (command.actions) {
        let varsGenerated = []
        for (let i = 0; i < command.actions.length; i++) {
            let action:ChatAction = new CommandHandle.ChatAction[`${command.actions[i].action}`](command.actions[i])
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
async function permissionCheck(command:CommandType, user:string): Promise<string> {
    if (command.disabled == true) {
        showToast(`${command.commandName} attempted to run but was disabled.`);
        return "NOMESSAGE"
    }

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

function postCommandRun(command: CommandType, context: TriggerContext) {
    // Increment the command uses by one
    CommandHandle.addCommandCount(command.commandName);

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

    // If the command is to be removed we remove it
    if (command.shouldDelete && context.messageId) {
        setTimeout(async () => {
            let messageDeleted = await ApiHandle.deleteMessage(Number(context.messageId));
            if (messageDeleted) {
                LogHandle.logEvent({ event: "Delete Message", users: ["Glimboi", context.user.username], data: { messageID: context.messageId } })
                adjustMessageState(Number(context.messageId), "deleted");
            }
        }, 400);
    }
}

/**
 * Adds variables from a command context
 */
function injectVariables(variables: ContextPossibleVariables) {
    if (variables.recipient) {
        CommandHandle.ChatAction.ActionResources.addVariable({name: "$recipient", data: variables.recipient.username});
    } else if (variables.donation) {
        CommandHandle.ChatAction.ActionResources.addVariable({name: "$donationAmount", data: variables.donation.amount});
    }
}

/**
 * Removes variables that were generated from a command textext
 */
function withdrawVariables(variables: ContextPossibleVariables) {
    // TO DO -- When you have multiple variables to remove add them to an array and send it. One call, rather than many calls.
    if (variables.recipient) {
        CommandHandle.ChatAction.ActionResources.removeVariables(["$recipient"]);
    } else if (variables.donation) {
        CommandHandle.ChatAction.ActionResources.removeVariables(["$donationAmount"]);
    }
}

export {checkCommand, runCommand}