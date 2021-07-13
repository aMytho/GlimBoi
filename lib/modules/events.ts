// This file contains games and events.

var arrayOfEvents:eventName[] = [];

/**
 * Manages events
 */
const bankHeist = require(appData[0] + "/modules/events/bankHeist.js")
const poll = require(appData[0] + "/modules/events/poll.js")
const duel = require(appData[0] + "/modules/events/duel.js")
const glimRealm = require(appData[0] + "/modules/events/glimRealm.js")
const raffle = require(appData[0] + "/modules/events/raffle.js")

/**
 * Event Handler. Inputs the event and does the required action with the other paramaters. This allows multiple events to be run at the same time.
 * @param {string} event
 * @param {string} user
 * @param {string} message
 */
function handleEvent(event:eventName, user:userName, message: string) {
    switch (event) {
        case "raffle":
            if (message.startsWith('!enter')) {
                raffle.addUserRaffle(user)
            }
        break;
        case "poll":
            if (message.startsWith('!vote') || message.startsWith("!v")) {
                var pollUsers = poll.getUsers();
                let splitMessage:string[] = message.split(" ");
                if (splitMessage[1] == null || splitMessage[1] == undefined || splitMessage[1] == "") {
                    ChatMessages.filterMessage("@" + user + ", Please respond with a number indicating your response. ex. !vote 1, !v 1", "glimboi");
                } else if (!pollUsers.includes(user)) {
                    // Note that the number is a string, since we only subtract it nothing breaks.
                    // @ts-ignore
                    poll.updatePollData(user, splitMessage[1] - 1)
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
                                if (userInfo !== "INVALIDUSER" && userInfo !== "USEREXISTS") {
                                    glimrealmUsers.push(userInfo.userName);
                                    userInfo.userName
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
function setCurrentEvents(data:eventName[]) {
    arrayOfEvents = data
    console.log(arrayOfEvents)
}

export {bankHeist, duel, getCurrentEvents, glimRealm, handleEvent, poll, raffle, setCurrentEvents}