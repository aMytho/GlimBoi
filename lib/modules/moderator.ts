



function timeoutByUsername(type:timeout, user:userName, origin:origin, ID?: number) {
    console.log(type + "timeout sent to " + user);
    let channelID = ApiHandle.getID();
    if (channelID !== "") {
        // The main difference is we have the ID and respond to the tm in chat.
        if (origin == "ruleset") {
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
    function errorMessageTM(errorMSG:string) {
        let msgToChange:HTMLElement = document.getElementById("moderateMessage")!
        if (origin == "manual") {
            msgToChange.innerText = errorMSG
            setTimeout(() => {
                msgToChange.innerText = ""
            }, 5000);
        }
    }
}

function handleTimeout(user:string, origin:origin, data) {
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
    function timeoutResult(message:string) {
        if (origin == "manual") {
            document.getElementById("moderateMessage")!.innerText = message
            setTimeout(() => {
                document.getElementById("moderateMessage")!.innerText = ""
            }, 5000);
        } else {
            ChatMessages.filterMessage(user + " has been timed out for 5 minutes.", "glimboi")
        }
    }
}

function timeoutByUserID(type:timeout, ID:number) {
    console.log(type + "timeout sent to user" + ID);
}

function banByUsername(user:userName, origin:origin) {
    let channelID = ApiHandle.getID();
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
    function errorMessageBan(errorMSG:string) {
        let bnMsg = document.getElementById("moderateMessage")!
        if (origin == "manual") {
            bnMsg.innerText = errorMSG
            setTimeout(() => {
                bnMsg.innerText = ""
            }, 5000);
        }
    }
}

function handleBan(user:userName, origin:origin, data) {
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
    function banResult(message:string) {
        let modMsg = document.getElementById("moderateMessage")!
        if (origin == "manual") {
            modMsg.innerText = message
            setTimeout(() => {
                modMsg.innerText = ""
            }, 5000);
        } else {

        }
    }
}

function unBanByUsername(user:userName, origin:origin) {
    let channelID = ApiHandle.getID();
    if (channelID !== "") {
        ApiHandle.getUserID(user).then(data => {
            console.log(data);
            if (typeof data == "number") {
                ApiHandle.unBanUser(Number(channelID), data).then(data => handleUnBan(user, origin, data))
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
    function errorMessageUB(errorMSG:string) {
        let modMsg = document.getElementById("moderateMessage")!
        if (origin == "manual") {
            modMsg.innerText = errorMSG
            setTimeout(() => {
                modMsg.innerText = ""
            }, 4500);
        }
    }
}

function handleUnBan(user:userName, origin:origin, data) {
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
    function unBanResult(message:string) {
        let modMsg = document.getElementById("moderateMessage")!
        if (origin == "manual") {
            modMsg.innerText = message
            setTimeout(() => {
                modMsg.innerText = ""
            }, 5000);
        } else {

        }
    }
}







export { banByUsername, timeoutByUsername, timeoutByUserID, unBanByUsername }