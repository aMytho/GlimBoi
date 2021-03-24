// This file contains games and events.
var arrayOfEvents = [];

/**
 * Manages Bankheist events
 */
var bankHeist = require(appData[0] + "/chatbot/lib/events/bankHeist.js");
var poll = require(appData[0] + "/chatbot/lib/events/poll.js");
var duel = require(appData[0] + "/chatbot/lib/events/duel.js");
var glimRealm = require(appData[0] + "/chatbot/lib/events/glimRealm.js");
var raffle = require(appData[0] + "/chatbot/lib/events/raffle.js");

/**
 * Event Handler. Inputs the event and does the required action with the other paramaters. This allows multiple events to be run at the same time.
 * @param {string} event
 * @param {string} user
 * @param {string} message
 */
function handleEvent(event, user, message) {
    switch (event) {
        case "raffle":
            if (message.startsWith('!enter')) {
                raffle.addUserRaffle(user)
            }
        break;
        case "poll":
            if (message.startsWith('!vote') || message.startsWith("!v")) {
                var pollUsers = poll.getUsers()
                message = message.split(" ");
                if (message[1] == null || message[1] == undefined || message[1] == "") {
                    ChatMessages.filterMessage("@" + user + ", Please respond with a number indicating your response. ex. !vote 1, !v 1", "glimboi");
                } else if (!pollUsers.includes(user)) {
                    // Note that the number is a string, since we only subtract it nothing breaks.
                    poll.updatePollData(user, message[1] - 1)
                } else {
                    console.log("The user " + user + " has already entered the poll or tried a conflicting command.");
                }
            }
        break;
        case "glimrealm":
            if (message.startsWith('!portal')) {
                var glimrealmUsers = glimRealm.getGlimRealmUsers();
                console.log(glimrealmUsers);
                if (!glimrealmUsers.includes(user)) {
                    UserHandle.findByUserName(user.toLowerCase()).then(data => {
                        if (data !== "ADDUSER") {
                            glimrealmUsers.push(user);
                            glimRealm.setGlimRealmUsers(glimrealmUsers);
                            glimRealm.glimDropRealm(user, data);
                        } else {
                            ChatMessages.filterMessage("You must be a user in the bot to join this game. Type !user new " + user.toLowerCase(), "glimboi") // the user doesn't exist
                        }
                    })
                } else {
                    ChatMessages.filterMessage("@" + user + ", You have already entered the Glimrealm.", "glimboi")
                }
            }
        break;

        default:
        break;
    }
}


/**
 * Loads the events. (chat games, etc)
 */
function loadEvents() {
    console.log("Loading all of the events.")
}

/**
 * Returns current events
 * @returns {array}
 */
function getCurrentEvents() {
    return arrayOfEvents
}

/**
 *
 * @param {array} data An array of updated events
 */
function setCurrentEvents(data) {
    arrayOfEvents = data
    console.log(arrayOfEvents)
}

module.exports = {bankHeist, duel, getCurrentEvents, glimRealm, handleEvent, loadEvents, poll, raffle, setCurrentEvents}