// This file handles filtering and mod actions.

var filterLevel = false;
var warnings = {};
var badWords;

function timeoutByUsername(type, user, origin, ID) {
    console.log(type + "timeout sent to " + user);
    var channelID = ApiHandle.getID();
    if (channelID !== "") {
        // The main difference is we have the ID and respond to the tm in chat.
        if (origin == "chat") {
            ApiHandle.timeoutUser(type, channelID, ID).then(data => handleTimeout(user, origin, data))
        } else {
            ApiHandle.getUserID(user).then(data => {
                if (typeof data == "number") {
                    ApiHandle.timeoutUser(type, channelID, data).then(data => handleTimeout(user, origin, data))
                } else if (data == null) {
                    console.log("The user doesn't exist.");
                    errorMessageTM("Error: The user does not exist or you do not have permission to moderate.")
                } else {
                    console.log("Error with timeout");
                    errorMessageTM("Error: The user does not exist or you do not have permission to moderate.")
                }
            })
        }
    } else {
        console.log("No channel ID for timeout");
        errorMessageTM("You must be in a channel to use this feature.")
    }
    function errorMessageTM(errorMSG) {
        if (origin == "GUI") {
            document.getElementById("moderateMessage").innerText = errorMSG
            setTimeout(() => {
                document.getElementById("moderateMessage").innerText = ""
            }, 5000);
        }
    }
}

function handleTimeout(user, origin, data) {
    console.log(data);
    if (data == null) {
        console.log("unknown error with timeout");
        timeoutResult("Unknown error. The user is likely not affected. Ensure you are authenticated and in a chat.");
    } else if (data.status !== undefined) {
        console.log(data.error)
        timeoutResult(data.error + " Ensure the bot is modded and you are in a chat.")
    } else {
        console.log("Timeout Successful.");
        timeoutResult(user + " has been timed out.")
    }
    function timeoutResult(message) {
        if (origin == "GUI") {
            document.getElementById("moderateMessage").innerText = message
            setTimeout(() => {
                document.getElementById("moderateMessage").innerText = ""
            }, 5000);
        } else {
            ChatMessages.filterMessage(user + " has been timed out for 5 minutes.", "glimboi")
        }
    }
}

function timeoutByUserID(type, ID, modal) {
    console.log(type + "timeout sent to user" + ID);
}

function banByUsername(user, origin) {
    var channelID = ApiHandle.getID();
    if (channelID !== "") {
        ApiHandle.getUserID(user).then(data => {
            console.log(data);
            if (typeof data == "number") {
                ApiHandle.banUser(channelID, data).then(data => handleBan(user, origin, data))
            } else if (data == null) {
                console.log("The user doesn't exist.");
                errorMessageBan("Error: The user does not exist or you do not have permission to moderate.")
            } else {
                console.log("Error with timeout");
                errorMessageBan("Error: The user does not exist or you do not have permission to moderate.")
            }
        })
    } else {
        console.log("No channel ID for ban");
        errorMessageBan("You must be in a channel to use this feature.")
    }
    function errorMessageBan(errorMSG) {
        if (origin == "GUI") {
            document.getElementById("moderateMessage").innerText = errorMSG
            setTimeout(() => {
                document.getElementById("moderateMessage").innerText = ""
            }, 5000);
        }
    }
}

function handleBan(user, origin, data) {
    console.log(data);
    if (data == null) {
        console.log("unknown error with ban");
        banResult("Unknown error. The user is likely not affected. Ensure you are authenticated and in a chat.");
    } else if (data.status !== undefined) {
        console.log(data.error)
        banResult(data.error + " Ensure the bot is modded and you are in a chat.")
    } else {
        console.log("Ban Successful.");
        banResult(user + " has been banned.")
    }
    function banResult(message) {
        if (origin == "GUI") {
            document.getElementById("moderateMessage").innerText = message
            setTimeout(() => {
                document.getElementById("moderateMessage").innerText = ""
            }, 5000);
        } else {

        }
    }
}

function unBanByUsername(user, origin) {
    var channelID = ApiHandle.getID();
    if (channelID !== "") {
        ApiHandle.getUserID(user).then(data => {
            console.log(data);
            if (typeof data == "number") {
                ApiHandle.unBanUser(channelID, data).then(data => handleUnBan(user, origin, data))
            } else if (data == null) {
                console.log("The user doesn't exist.");
                errorMessageUB("Error: The user does not exist or you do not have permission to moderate.")
            } else {
                console.log("Error with unabn");
                errorMessageUB("Error: The user does not exist or you do not have permission to moderate.")
            }
        })
    } else {
        console.log("No channel ID for unban");
        errorMessageUB("You must be in a channel to use this feature.")
    }
    function errorMessageUB(errorMSG) {
        if (origin == "GUI") {
            document.getElementById("moderateMessage").innerText = errorMSG
            setTimeout(() => {
                document.getElementById("moderateMessage").innerText = ""
            }, 4500);
        }
    }
}

function handleUnBan(user, origin, data) {
    console.log(data);
    if (data == null) {
        console.log("unknown error with unban");
        unBanResult("Unknown error. The user is likely not affected. Ensure you are authenticated and in a chat.");
    } else if (data.status !== undefined) {
        console.log(data.error)
        unBanResult(data.error + " Ensure the bot is modded and you are in a chat.")
    } else {
        console.log("Unban Successful.");
        unBanResult(user + "'s ban has been removed.")
    }
    function unBanResult(message) {
        if (origin == "GUI") {
            document.getElementById("moderateMessage").innerText = message
            setTimeout(() => {
                document.getElementById("moderateMessage").innerText = ""
            }, 5000);
        } else {

        }
    }
}


/**
 *
 * @param {string} user
 * @param {string} message
 */
function scanMessage(user, message, userID) {
    if (filterLevel == true) {
        // The user exists, in the future we would get their rank to determine the filter to check against
        message = message.split(" ");
        var badWordFound = 0;
        // for every word...
        for (let index = 0; index < message.length; index++) {
            // compare against every bad word.
            var badWordFound = badWords.indexOf(message[index]);
            if (badWordFound !== -1) {
                console.log("Getting a bar of soap for " + user);
                timeoutByUsername("short", user, "chat", userID);
                break
            }
        }
    }
}

function updateFilter(status) {
    filterLevel = status;
    console.log("Filter status: " + status);
}

function importFilter() {
    fs.readFile(appData[0] + '/chatbot/resources/badWordFilter.json', 'utf8' , (err, data) => {
        if (err) {
            console.error(err);
            errorMessage(err, "Filter Error. The chat filter did not load correctly. You may need to reload the bot.");
            badWords = []; // We make it an array so if the filter is still used it won't break the bot when badWords.indexOf() is called
            return
        }
        badWords = JSON.parse(data);
    })
}

module.exports = { banByUsername, importFilter, scanMessage, timeoutByUsername, timeoutByUserID, unBanByUsername, updateFilter }