let bannedWordsDB:Nedb
let activeWarnings: warning[] = [];
let bannedWords: string[] = [];

async function scanMessage(user:userName, message:string, messageID:number, userID:number) {
    if (settings.Moderation.filterEnabled) {
        // The user exists
        let parsedMessage = message.split(" ")
        var badWordFound = 0;
        // for every word...
        for (let index = 0; index < parsedMessage.length; index++) {
            // compare against every bad word.
            var badWordFound = bannedWords.indexOf(parsedMessage[index]);
            if (badWordFound !== -1) {
                let userExists = await UserHandle.findByUserName(user);
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

function getUserWarnings(user:string) {
    for (let i = 0; i < activeWarnings.length; i++) {
        if (user == activeWarnings[i].user) {
            return activeWarnings[i].amount
        }
    }
    return 0
}

function updateUserWarnings(user:string, amount:number) {
    for (let i = 0; i < activeWarnings.length; i++) {
        if (user == activeWarnings[i].user) {
            activeWarnings.splice(i,1, {user:user, amount: amount})
        }
    }
}

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

async function checkModPerms(user: userName, targetUser:userName | number, modRequest: modAction, modInfo: modInfoPack) {
    let userExists = await UserHandle.findByUserName(user);
    if (userExists !== "ADDUSER") {
        let hasPerms = await RankHandle.rankController(userExists.userName, modRequest, "string");
        if (hasPerms == true) {
            determineModAction(modRequest, modInfo)
        } else if (hasPerms == false) {

        } else {

        }
    } else {
        return "You do not have that permission"
    }
}

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
        default:
            break;
    }
    // If no cause was provided its a ruleset action or the streamer
    if (!modInfo.caused) {
        modInfo.caused = "Glimboi"
    }
    console.log(result)
    if (result !== null && typeof result !== "object") {
        LogHandle.logEvent({event: getFriendlyName(action) , users: [modInfo.caused, result], data: modInfo})
    }
    // THe streamer did this from the bot, we check the page and use that to determine what to show them
    if (modInfo.source == "manual") {

    }
}

function getFriendlyName(name: string) {
    switch (name) {
        case "deleteMessage": return "Delete Message"
        case "shortTimeout": return "Short Timeout User"
        case "longTimeout": return "Long Timeout User"
        case "ban": return "Ban User"
        case "unBan": return "UnBan User"
    }
}

function loadFilter(updatedPath:string) {
    bannedWordsDB = new Datastore({ filename: `${updatedPath}/data/bannedWordList.db`, autoload: true })
    bannedWordsDB.find({}, function(err: any, data:bannedWordsDB) {
        if (data.length == 0) {
            bannedWordsReset()
        } else {
            bannedWords = data[0].words
        }
    })
}

function bannedWordsReset() {
    return new Promise(resolve => {
        fs.readFile("./resources/json/defaultBannedWords.json", 'utf-8', function (err:NodeJS.ErrnoException, data:string) {
            if (err) {
                console.log("We couldn't get the default banned word file. " + err);
                errorMessage(err, "Failed to import the default list of banned words. Filter is not active.");
                resolve(null)
                return
            }
            bannedWordsDB.insert({words: JSON.parse(data)}, function(err, data) {
                console.log("Default banned word list imported and saved.");
                bannedWords = data.words;
                resolve(true)
            })
        });
    })
}

function getFilter():string[] {
    return bannedWords
}

/**
 * Adds or removes a word from the filter list
 * @param word The word to add/remove
 * @param wordAction add or remove
 * @returns Returns true if operation succeeded, and an error message if not
 */
function checkBannedWordAndModify(word: string, wordAction: bannedWordAction): true | string {
    if (wordAction == "add") {
        if (!bannedWords.includes(word)) {
            bannedWords.push(word);
            console.log(`Adding ${word} to the banned list`)
            bannedWordsDB.update({}, { $push: { words: word } }, {}, function () { })
            return true
        } else {
            return `${word} has already been added to the list.`
        }
    } else if (wordAction == "remove") {
        for (let i = 0; i < bannedWords.length; i++) {
            if (word == bannedWords[i]) {
                bannedWords.splice(i, 1);
                console.log(`Removing ${word} from the banned list.`)
                bannedWordsDB.update({}, { $pull: { words: word } }, {}, function () { })
                return true
            }
        }
        return `${word} does not exist in the list.`
    }
}

function sendModMessage(user:userName, amount:number) {

}

/**
 * Deletes a message from Glimesh chat
 * @param messageID The ID of the message that will be deleted
 */
 function deleteMessage(messageID: number) {
     console.log(`Trying to delete message with id ${messageID}`)
    let bodyContent = `mutation {deleteMessage(channelId:${ApiHandle.getID()}, messageId:${messageID}) {updatedAt, user {username}}}`
    return ApiHandle.glimeshApiRequest(bodyContent, "deleteMessage");
}

async function timeoutByUsername(username: userName, duration: timeout) {
    console.log(`Trying to timeout user with name ${username} ${duration}`)
    if (ChatHandle.isConnected()) {
        let timeoutType:"longTimeoutUser" | "shortTimeoutUser"
        duration == "long"? timeoutType = "longTimeoutUser" : timeoutType = "shortTimeoutUser"
        let ID = await UserHandle.findByUserName(username);
        if (typeof ID !== "string") {
            let bodyContent = `mutation {${timeoutType}(channelId:${ApiHandle.getID()}, userId:${ID.id}) {updatedAt, user {username}}}`
            return ApiHandle.glimeshApiRequest(bodyContent, timeoutType);
        } else {
            let newID = await ApiHandle.getUserID(username);
            if (newID !== null && typeof newID !== "object") {
                let bodyContent = `mutation {${timeoutType}(channelId:${ApiHandle.getID()}, userId:${newID}) {updatedAt, user {username}}}`
                return ApiHandle.glimeshApiRequest(bodyContent, "shortTimeoutUser");
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

function timeoutByUserID(id: number, duration: timeout) {
    console.log(`Trying to timeout user with id ${id} ${duration}`)
    let timeoutType:glimeshMutation
    duration == "long"? timeoutType = "longTimeoutUser" : timeoutType = "shortTimeoutUser"
    let bodyContent = `mutation {${timeoutType}(channelId:${ApiHandle.getID()}, userId:${id}) {updatedAt, user {username}}}`
    return ApiHandle.glimeshApiRequest(bodyContent, timeoutType);
}

async function banByUsername(username: userName) {
    console.log(`trying to ban a user with username ${username}`)
    let userID = await ApiHandle.getUserID(username);
    if (typeof userID !== "object") {
        let bodyContent = `mutation {banUser(channelId:${ApiHandle.getID()}, userId:${userID}) {updatedAt, user {username}}}`
        return ApiHandle.glimeshApiRequest(bodyContent, "ban");
    } else {
        errorMessage("Auth/User Error", "You must be in a chat and have the permissions to do that action. The user must exist.")
        return null
    }
}

function banByUserID(userID: number) {
    console.log(`Trying to bane a user with ID ${userID}`)
    let bodyContent = `mutation {banUser(channelId:${ApiHandle.getID()}, userId:${userID}) {updatedAt, user {username}}}`
    return ApiHandle.glimeshApiRequest(bodyContent, "ban");
}

async function unBanByUsername(username: userName) {
    let userID = await ApiHandle.getUserID(username);
    if (typeof userID !== "object") {
        let bodyContent = `mutation {unbanUser(channelId:${ApiHandle.getID()}, userId:${userID}) {updatedAt, user {username}}}`
        return ApiHandle.glimeshApiRequest(bodyContent, "ban");
    } else {
        errorMessage("Auth/User Error", "You must be in a chat and have the permissions to do that action. The user must exist.")
        return null
    }
}

function unBanByUserID(userID: number) {
    let bodyContent = `mutation {unbanUser(channelId:${ApiHandle.getID()}, userId:${userID}) {updatedAt, user {username}}}`
    return ApiHandle.glimeshApiRequest(bodyContent, "unBan");
}

export {bannedWordsReset, checkBannedWordAndModify, deleteMessage, determineModAction, getFilter, getUserWarnings, loadFilter, scanMessage, timeoutByUserID ,timeoutByUsername}