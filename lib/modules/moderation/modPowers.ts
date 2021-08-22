// File handles all moderation powers.

let activeWarnings: warning[] = [];

/**
 * Scans a message and takes action depending on the users settings
 * @param {string} message The message to scan
 * @param {string} user The user that sent the message
 * @param {number} messageID The ID of the message
 * @param {number} userID The ID of the user who said the message
 */
async function scanMessage(user:userName, message:string, messageID:number, userID:number) {
    if (settings.Moderation.filterEnabled) {
        // The user exists
        let parsedMessage = message.split(" ")
        let badWordFound = 0;
        // for every word...
        for (let index = 0; index < parsedMessage.length; index++) {
            // compare against every bad word.
            badWordFound = ModHandle.getBannedWords().indexOf(parsedMessage[index]);
            if (badWordFound !== -1) {
                let userExists = await UserHandle.findByUserName(user.toLowerCase());
                if (userExists == "ADDUSER") {
                    await UserHandle.addUser(user, false, "Glimboi");
                    scanMessage(user, message, messageID, userID);
                } else {
                    let userRank = await RankHandle.rankController(user, "modImmunity", "string");
                    // If they have immunity we just leave the function
                    if (userRank) return;
                    let userWarnings = getUserWarnings(user);
                    switch (userWarnings) {
                        case 0:
                            activeWarnings.push({ user: user, amount: 1 });
                            determineModAction(settings.Moderation.warning1, { messageID: messageID, userID: userID, userName: user })
                            forgiveUserWarnings(user, 1)
                            break;
                        case 1:
                            updateUserWarnings(user, userWarnings + 1);
                            determineModAction(settings.Moderation.warning2, { messageID: messageID, userID: userID, userName: user })
                            forgiveUserWarnings(user, userWarnings + 1)
                            break;
                        case 2:
                            updateUserWarnings(user, userWarnings + 1);
                            determineModAction(settings.Moderation.warning3, { messageID: messageID, userID: userID, userName: user })
                            forgiveUserWarnings(user, userWarnings + 1)
                            break;
                        default:
                            updateUserWarnings(user, userWarnings + 1);
                            determineModAction(settings.Moderation.warningAbove, { messageID: messageID, userID: userID, userName: user })
                            forgiveUserWarnings(user, userWarnings + 1)
                            break;
                    }
                }
                console.log("Getting a bar of soap for " + user);
                break
            }
        }
    }
}

/**
 * Determines what action to take when a user is warned
 * @param {action} action The action to take
 * @param {object} modInfo The data to use in the action
 */
async function determineModAction(action: modAction, modInfo:modInfoPack) {
    console.log(action, modInfo)
    let result:any;
    switch (action) {
        case "deleteMessage": result = await deleteMessage(modInfo.messageID)
            break;
        case "shortTimeout":
            modInfo.userID ? result = await timeoutByUserID(modInfo.userID, "short") : result = await timeoutByUsername(modInfo.userName, "short")
            break;
        case "longTimeout":
            modInfo.userID ? result = await timeoutByUserID(modInfo.userID, "long") : result = await timeoutByUsername(modInfo.userName, "long")
            break;
        case "ban":
            modInfo.userID ? result = await banByUserID(modInfo.userID) : result = await banByUsername(modInfo.userName)
            break;
        case "unBan":
            modInfo.userID ? result = await unBanByUserID(modInfo.userID) : result = await unBanByUsername(modInfo.userName)
            break;
        case "none": return
            break;
        default:
            break;
    }
    // If no cause was provided its a ruleset action or the streamer
    if (!modInfo.caused) {
        modInfo.caused = "Glimboi"
    }
    console.log(result);
    if (result !== null && typeof result !== "object") {
        LogHandle.logEvent({event: getFriendlyName(action) , users: [modInfo.caused, result], data: modInfo})
    }
    // THe streamer did this from the bot, we check the page and use that to determine what to show them
    if (modInfo.source == "ruleset" && settings.Moderation.modMessage) {
        //sendModMessage(String(modInfo.userName));
    }
}

/**
 * Returns how many warnings the user has
 * @param {string} user The user to get warnings for
 * @returns {number} The amount of warnings the user has
 */
function getUserWarnings(user:string) {
    for (let i = 0; i < activeWarnings.length; i++) {
        if (user == activeWarnings[i].user) {
            return activeWarnings[i].amount
        }
    }
    return 0
}

/**
 * Updates the amount of warnings a user has
 * @param {string} user The user to update
 * @param {number} amount The amount to update the user to
 */
function updateUserWarnings(user:string, amount:number) {
    for (let i = 0; i < activeWarnings.length; i++) {
        if (user == activeWarnings[i].user) {
            activeWarnings.splice(i,1, {user:user, amount: amount})
        }
    }
}

/**
 * Removes a warning from the active warnings array after 15 minutes
 * @param {string} user The user to remove the warning from
 * @param {number} amount How many warnigns they currently have
 */
function forgiveUserWarnings(user:userName, amount: number) {
    setTimeout(() => {
        for (let i = 0; i < activeWarnings.length; i++) {
            if (user == activeWarnings[i].user) {
                if (activeWarnings[i].amount !== amount) { // They added a new warning since then, we don't do anything
                    return
                } else {
                    if (amount - 1 == 0) {
                        activeWarnings.splice(i, 1); // Removes the user from the warnings entirely
                    } else {// Some warnings are still there, lower by 1
                        activeWarnings.splice(i, 1, {user:user, amount: amount - 1})
                        forgiveUserWarnings(user, amount - 1)
                    }
                }
            }
        }
    }, 900000);
}

/**
 * Returns the friendly name of the mod action
 * @param {string} name The name of the mod action
 * @returns {string} The friendly name of the mod action
 */
function getFriendlyName(name: string): logEvent {
    switch (name) {
        case "deleteMessage": return "Delete Message"
        case "shortTimeout": return "Short Timeout User"
        case "longTimeout": return "Long Timeout User"
        case "ban": return "Ban User"
        case "unBan": return "UnBan User"
    }
}

/**
 * Deletes a message from Glimesh chat
 * @param messageID The ID of the message that will be deleted
 */
async function deleteMessage(messageID: number) {
    console.log(`Trying to delete message with id ${messageID}`)
    let bodyContent = `mutation {deleteMessage(channelId:${ApiHandle.getID()}, messageId:${messageID}) {updatedAt, user {username}}}`
    let deletedMessage = await ApiHandle.glimeshApiRequest(bodyContent, "deleteMessage");
    if (typeof deletedMessage == "string") {// It succeeded
        adjustMessageState(messageID, "deleted");
    }
    return deletedMessage
}

/**
 * Times out a user using their username
 * @param {string} username The username of the user to timeout
 * @param {string} duration The duration of the timeout
 */
async function timeoutByUsername(username: userName, duration: timeout) {
    console.log(`Trying to timeout user with name ${username} ${duration}`)
    if (ChatHandle.isConnected()) {
        let timeoutType: "longTimeoutUser" | "shortTimeoutUser"
        duration == "long" ? timeoutType = "longTimeoutUser" : timeoutType = "shortTimeoutUser"
        let ID = await UserHandle.findByUserName(username);
        if (typeof ID !== "string") {
            let bodyContent = `mutation {${timeoutType}(channelId:${ApiHandle.getID()}, userId:${ID.id}) {updatedAt, user {username}}}`
            let result = await ApiHandle.glimeshApiRequest(bodyContent, timeoutType);
            console.log(result);
            if (typeof result == "string") {// It succeeded
                adjustMessageStateByUsername(result, "timeout")
            }
            return result
        } else {
            let newID = await ApiHandle.getUserID(username);
            if (typeof newID == "number") {
                let bodyContent = `mutation {${timeoutType}(channelId:${ApiHandle.getID()}, userId:${newID}) {updatedAt, user {username}}}`
                let result = await ApiHandle.glimeshApiRequest(bodyContent, timeoutType);
                if (typeof result == "string") {// It succeeded
                    adjustMessageStateByUsername(result, "timeout");
                }
                return result
            } else {
                errorMessage("Auth/user Error", "You must be in a chat and the the permissions to use that action. The user must exist.");
                return null
            }
        }
    } else {
        errorMessage("Channel Error", "You must be in a chat to do a mod action. You must also have the permission to do the mod action.");
        return null
    }
}

/**
 * Times out a user using their user ID
 * @param {number} id The ID of the user to timeout
 * @param {string} duration The duration of the timeout
 */
async function timeoutByUserID(id: number, duration: timeout) {
    if (!ChatHandle.isConnected()) {
        errorMessage("Channel Error", "You must be in a chat to do a mod action. You must also have the permission to do the mod action.");
        return null
    }
    console.log(`Trying to timeout user with id ${id} ${duration}`);
    let timeoutType: glimeshMutation
    duration == "long" ? timeoutType = "longTimeoutUser" : timeoutType = "shortTimeoutUser"
    let bodyContent = `mutation {${timeoutType}(channelId:${ApiHandle.getID()}, userId:${id}) {updatedAt, user {username}}}`
    let result = await ApiHandle.glimeshApiRequest(bodyContent, timeoutType);
    if (typeof result == "string") {// It succeeded
        adjustMessageStateByUsername(result, "timeout");
        return result
    } else {
        errorMessage("Auth/user Error", "You must be in a chat and the the permissions to use that action. The user must exist.");
        return null
    }
}

/**
 * Bans a user using their username
 * @param {string} username The username of the user to ban
 */
async function banByUsername(username: userName) {
    if (!ChatHandle.isConnected()) {
        errorMessage("Channel Error", "You must be in a chat to do a mod action. You must also have the permission to do the mod action.");
        return null
    }
    console.log(`trying to ban a user with username ${username}`)
    let userID = await ApiHandle.getUserID(username);
    if (typeof userID == "number") {
        let bodyContent = `mutation {banUser(channelId:${ApiHandle.getID()}, userId:${userID}) {updatedAt, user {username}}}`
        let result = await ApiHandle.glimeshApiRequest(bodyContent, "ban");
        if (typeof result == "string") {// It succeeded
            adjustMessageStateByUsername(result, "ban");
            return result
        } else {
            errorMessage("Auth/user Error", "You must be in a chat and the the permissions to use that action. The user must exist.");
            return null
        }
    } else {
        errorMessage("Auth/User Error", "You must be in a chat and have the permissions to do that action. The user must exist.")
        return null
    }
}

/**
 * Bans a user using their user ID
 * @param {number} userID The ID of the user to ban
 */
async function banByUserID(userID: number) {
    if (!ChatHandle.isConnected()) {
        errorMessage("Channel Error", "You must be in a chat to do a mod action. You must also have the permission to do the mod action.");
        return null
    }
    console.log(`Trying to bane a user with ID ${userID}`)
    let bodyContent = `mutation {banUser(channelId:${ApiHandle.getID()}, userId:${userID}) {updatedAt, user {username}}}`
    let result = await ApiHandle.glimeshApiRequest(bodyContent, "ban");
    if (typeof result == "string") {// It succeeded
        adjustMessageStateByUsername(result, "ban");
        return result
    } else {
        errorMessage("Auth/user Error", "You must be in a chat and the the permissions to use that action. The user must exist.");
        return null
    }
}

/**
 * Unbans a user using their username
 * @param {string} username The username of the user to unban
 */
async function unBanByUsername(username: userName) {
    if (!ChatHandle.isConnected()) {
        errorMessage("Channel Error", "You must be in a chat to do a mod action. You must also have the permission to do the mod action.");
        return null
    }
    let userID = await ApiHandle.getUserID(username);
    if (typeof userID == "number") {
        let bodyContent = `mutation {unbanUser(channelId:${ApiHandle.getID()}, userId:${userID}) {updatedAt, user {username}}}`
        return ApiHandle.glimeshApiRequest(bodyContent, "unBan");
    } else {
        errorMessage("Auth/User Error", "You must be in a chat and have the permissions to do that action. The user must exist.")
        return null
    }
}

/**
 * Unbans a user using their user ID
 * @param {number} userID The ID of the user to unban
 */
function unBanByUserID(userID: number) {
    if (!ChatHandle.isConnected()) {
        errorMessage("Channel Error", "You must be in a chat to do a mod action. You must also have the permission to do the mod action.");
        return null
    }
    let bodyContent = `mutation {unbanUser(channelId:${ApiHandle.getID()}, userId:${userID}) {updatedAt, user {username}}}`
    return ApiHandle.glimeshApiRequest(bodyContent, "unBan");
}

// This function sends a message to chat so the user knows why their message was deleted
function sendModMessage(user: userName) {
    // choose a randome message to send
    let possibeMessages = [
        `Whoa there ${user}, don't say that.`,
        `${user}, you're not allowed to say that.`,
        `Watch your mouth ${user}!`,
        `I don't like your language ${user}.`,
        `I'm telling my mommy you said that ${user}`,
        `Stop it ${user}`
    ]
    // choose a random message to send
    let message = possibeMessages[Math.floor(Math.random() * possibeMessages.length)]
    // send the message
    ChatMessages.filterMessage(message, "glimboi");
}

export {banByUserID, banByUsername, deleteMessage, determineModAction, getUserWarnings, scanMessage, timeoutByUserID, timeoutByUsername, unBanByUserID, unBanByUsername}