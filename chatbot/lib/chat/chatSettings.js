// This file handles all of the chat settings
// Health, repeats, message checks (user to bot ratio), etc
var loggingEnabled = false; // Should we log chat messages to a text file?
var healthInterval; // An interval that reminds the user to take breaks
var repeatCommand; // An interval that sends repeating commands
var repeatSpamProtection = 15; // The minimum amount of non bot messages required to send a repeating message

/**
 * Loads and activates all the chat settings.
 * @param {object} settings
 */
function loadChatSettings(settings) {
    startLogs(settings.chat.logging);
    startHealth(settings.chat.health);
    startRepeatingCommands(settings.Commands.repeatDelay);
}

/**
 * Updates the chat settings.
 * @param {object} settings
 */
function updateChatSettings(settings) {
    updateHealth(settings.chat.health);
    updateRepeatingCommands(settings.Commands.repeatDelay);
    repeatSpamProtection = settings.Commands.repeatSpamProtection;
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
function startHealth(healthReminder) {
  if (healthReminder !== 0) {
    console.log("Health reminders are enabled. Interval: " + healthReminder + " minutes.");
    healthInterval = setInterval(() => {
      if (healthReminder == true) {
        ChatMessages.filterMessage(
          "You've been streaming for a while. Make sure to get up, stretch, drink some water, and take a break if needed.",
          "glimboi"
        );
      }
    }, healthReminder*60000);
  } else {
      console.log("Health reminders are disabled.")
  }
}

/**
 * Updates the health settings.
 * @param {boolean} healthEnabled
 * @param {number} healthReminder
 */
function updateHealth(healthReminder) {
    clearInterval(healthInterval); // Resets the health interval if it is already enabled
    startHealth(healthReminder) // updates the health reminder with the new settings
}

/**
 * Starts the logging process if it is enabled
 * @param {boolean} logEnabled
 */
function startLogs(logEnabled) {
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
 * Returns logging status
 * @returns {boolean} is logging enabled?
 */
function isLoggingEnabled() {
    return loggingEnabled
}

/**
 * Starts an interval to send repeating commands to chat. Dependent on repeat spam protection and delay.
 * @param {number} repeatDelay
 */
function startRepeatingCommands(repeatDelay) {
    //Sends a random repeatable message to chat based on the user setting.
    repeatCommand = setInterval(() => {
      if (ChatStats.getUserMessageCount() <= repeatSpamProtection) {
        console.log("There is not enough non bot messages to send a repeat message. Waitng till next time.");
      } else {
          console.log("Sending a repeating command.")
        CommandHandle.randomRepeatCommand() // Gets a repeatable command
      }
    }, repeatDelay*60000);
}


function updateRepeatingCommands(delay) {
    clearInterval(repeatCommand);
    startRepeatingCommands(delay)
}



module.exports = {isLoggingEnabled, loadChatSettings, stopChatSettings, updateChatSettings}