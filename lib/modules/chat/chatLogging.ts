let loggingFile: any;
let createWriteStream: any;

/**
 * Logs a message to a file if enabled.
 * @param user The user who said the message
 * @param message The message to be logged
 */
async function logMessageToFile(user, message) {
    if (CacheStore.get("chatLogging", false)) {
        if (loggingFile && loggingFile.closed == false) {
            try {
                loggingFile.write(`${user}: ${message} || ${new Date()}`, "utf-8")
            } catch (e) {
                console.log(e);
            }
        } else {
            let fileCreated = await startLogging();
            if (fileCreated) {
                logMessageToFile(user, message)
            }
        }
    }
}

/**
 * Starts the message logging.
 * @returns
 */
function startLogging():Promise<boolean> {
    return new Promise(async resolve => {
        createWriteStream = require("fs").createWriteStream;
        let logLocation = await ipcRenderer.invoke("getLogLocation");
        console.log(logLocation);
        if (logLocation == undefined || logLocation.canceled == true) {
            console.log("They did not select a file.");
            errorMessage("Logging Error", "You must select a file to log your chatmessages.");
            resolve(false);
        } else {
            loggingFile = createWriteStream(logLocation.filePath);
            console.log("Started logging chat messages.");
            resolve(true);
        }
    })
}

/**
 * Stops the message logging.
 */
function endMessageLogging() {
    try {
        loggingFile.end();
        console.log("Finishes chat logs.");
        showToast(`Message Logging Finished. ${loggingFile.path}`);
    } catch(e) {
        console.log(e);
    }
}

export {endMessageLogging, logMessageToFile, startLogging}