// This file handles filtering and mod actions.

function timeoutByUsername(type, user, origin) {
    console.log(type + "timeout sent to " + user);
    var channelID = ApiHandle.getID();
    if (channelID !== "") {
        ApiHandle.getUserID(user).then(data => {
            console.log(data);
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

module.exports = { banByUsername, timeoutByUsername, timeoutByUserID, unBanByUsername }