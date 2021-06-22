// This file contains games and events.

import * as UserHandle from "UserHandle"

var arrayOfEvents = [];

/**
 * Manages events
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
function handleEvent(event, user:userName, message) {
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
                user = user.toLowerCase()
                var glimrealmUsers = glimRealm.getGlimRealmUsers();
                if (!glimrealmUsers.includes(user)) {
                    UserHandle.findByUserName(user).then(data => {
                        if (data !== "ADDUSER") {
                            glimrealmUsers.push(user);
                            glimRealm.setGlimRealmUsers(glimrealmUsers);
                            glimRealm.glimDropRealm(user, data);
                        } else {
                            UserHandle.addUser(user, false).then(userInfo => {
                                if (data !== "INVALIDUSER") {
                                    glimrealmUsers.push(userInfo.userName);
                                    glimRealm.setGlimRealmUsers(glimrealmUsers);
                                    glimRealm.glimDropRealm(userInfo.userName, userInfo);
                                }
                            })
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

module.exports = {bankHeist, duel, getCurrentEvents, glimRealm, handleEvent, poll, raffle, setCurrentEvents}