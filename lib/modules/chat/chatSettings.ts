// This file handles all of the chat settings
// Health, repeats, message checks (user to bot ratio), etc
let healthInterval:NodeJS.Timeout; // An interval that reminds the user to take breaks
let repeatCommand:NodeJS.Timeout; // An interval that sends repeating commands

/**
 * Loads and activates all the chat settings.
 * @param {object} settings
 */
function loadChatSettings() {
    startLogs(CacheStore.get("chatLogging", false));
    startHealth(CacheStore.get("chatHealth", 0));
    startRepeatingCommands(CacheStore.get("commandRepeatDelay", 10, false));
}

/**
 * Updates the chat settings.
 * @param {object} settings
 */
function updateChatSettings() {
    updateHealth(CacheStore.get("chatHealth", 0));
    updateRepeatingCommands(CacheStore.get("commandRepeatDelay", 10, false));
}
/**
 * Called when the chat is disconnected. Turns off all intervals
 */
function stopChatSettings() {
    clearInterval(healthInterval);
    clearInterval(repeatCommand);
    console.log("All chat settings have been turned off.")
}

/**
 * Creates a health reminder if enabled.
 * @param {boolean} healthEnabled
 * @param {number} healthReminder
 */
function startHealth(healthReminder: number) {
    if (healthReminder !== 0) {
        console.log("Health reminders are enabled. Interval: " + healthReminder + " minutes.");
        console.log(healthInterval, healthReminder)
        healthInterval = setInterval(() => {
            if (healthReminder !== 0) {
                ChatMessages.filterMessage(
                    "You've been streaming for a while. Make sure to get up, stretch, drink some water, and take a break if needed.",
                    "glimboi"
                );
            }
        }, healthReminder * 60000);
    } else {
        console.log("Health reminders are disabled.")
    }
}

/**
 * Updates the health settings.
 * @param {boolean} healthEnabled
 * @param {number} healthReminder
 */
function updateHealth(healthReminder:number) {
    clearInterval(healthInterval); // Resets the health interval if it is already enabled
    startHealth(healthReminder) // updates the health reminder with the new settings
}

/**
 * Starts the logging process if it is enabled
 * @param {boolean} logEnabled
 */
function startLogs(logEnabled:boolean) {
    if (logEnabled) {
        setTimeout(() => { // Wait a few seconds and show a dialogue box. Asks for the location to log messages.
            ipcRenderer.send("startLogging", ""); // Tells the main process to start logging messages.
            ipcRenderer.once("startedLogging", (event, args) => { // When the main process recieves our request...
                console.log("Started to log chat messages.");
                successMessage("Logging has begun.", "All messages will be saved.");
            });
            ipcRenderer.once("noLogSelected", (event, args) => { // If the user didn't select a file...
                errorMessage("Logging Error", "No file was selected. Messages will not be saved.")
            });
            ipcRenderer.once("endedLog", (event, args) => { // When the logging finishes...
                console.log("Logging has ended."), successMessage("Logging has ended", "Finished.")
            })
        }, 3000);
    } else {
        console.log("Logs are not enabled.");
    }
}

/**
 * Starts an interval to send repeating commands to chat. Dependent on repeat spam protection and delay.
 * @param {number} repeatDelay
 */
function startRepeatingCommands(repeatDelay: number) {
    //Sends a random repeatable message to chat based on the user setting.
    repeatCommand = setInterval(() => {
        if (ChatStats.getUserMessageCount() <= CacheStore.get("commandRepeatProtection", 10, false)) {
            console.log("There is not enough non bot messages to send a repeat message. Waitng till next time.");
        } else {
            console.log("Sending a repeating command.")
            CommandHandle.randomRepeatCommand() // Gets a repeatable command
        }
    }, repeatDelay * 60000);
}

function updateRepeatingCommands(delay:number) {
    clearInterval(repeatCommand);
    startRepeatingCommands(delay)
}

export {loadChatSettings, stopChatSettings, updateChatSettings}