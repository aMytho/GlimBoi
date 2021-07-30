// This file contains games and events.

var arrayOfEvents:eventName[] = [];

/**
 * Bankheist Controller
 */
const bankHeist: typeof import("../modules/events/bankHeist") = require(appData[0] + "/modules/events/bankHeist.js");
/**
 * Poll Controller
 */
const poll: typeof import("../modules/events/poll") = require(appData[0] + "/modules/events/poll.js");
/**
 * Duel Controller
 */
const duel: typeof import("../modules/events/duel") = require(appData[0] + "/modules/events/duel.js");
/**
 * Glimrealm controller
 */
const glimRealm: typeof import("../modules/events/glimRealm") = require(appData[0] + "/modules/events/glimRealm.js");
/**
 * Raffle controller
 */
const raffle: typeof import("../modules/events/raffle") = require(appData[0] + "/modules/events/raffle.js");
/**
 * Giveaway controller
 */
const giveaway: typeof import("../modules/events/giveaway") = require(appData[0] + "/modules/events/giveaway.js");
/**
 * Glimroyale controller
 */
const glimroyale: typeof import("../modules/events/glimRoyale") = require(appData[0] + "/modules/events/glimRoyale.js");


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
                raffle.addUser(user.toLowerCase());
            }
        break;
        case "poll":
            if (message.startsWith('!vote') || message.startsWith("!v")) {
                let splitMessage:string[] = message.split(" ");
                let vote:number = parseInt(splitMessage[1]);
                if (isNaN(vote)) {
                    ChatMessages.filterMessage(`${user}, Please respond with a number indicating your response. ex. !vote 1, !v 1`, "glimboi");
                } else {
                    poll.addResponse(vote, user);
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
        case "duel":
            if (message.startsWith('!accept')) {
                console.log(`${user} accepted a duel`)
                duel.acceptDuel(user);
            } else if (message.startsWith('!decline')) {
                duel.declineDuel(user);
            }
        break;
        case "giveaway":
            if (message.startsWith('!enter') || message.startsWith('!join')) {
                giveaway.enterGiveaway(user);
            }
        break;
        case "glimroyale":
            if (message.startsWith('!join')) {
                let potentialUser = UserHandle.findByUserName(user);
                potentialUser.then(data => {
                    if (data == "ADDUSER") {
                        let newUser = UserHandle.addUser(user, false, user);
                        newUser.then(userInfo => {
                            if (userInfo == "INVALIDUSER") {
                                return;
                            } else if (userInfo == "USEREXISTS") {
                                return;
                            } else {
                                if (userInfo.points >= glimroyale.getWager()) {
                                    let joined = glimroyale.joinBattle(userInfo.userName);
                                    if (!joined) {
                                        ChatMessages.filterMessage(`@${user}, You have already joined the Glimroyale`, "glimboi");
                                    }
                                } else {
                                    ChatMessages.filterMessage("@" + user + ", You do not have enough points to join the Glimroyale.", "glimboi")
                                }
                            }
                        })
                    } else {
                        if (data.points >= glimroyale.getWager()) {
                            let joined = glimroyale.joinBattle(data.userName);
                            if (!joined) {
                                ChatMessages.filterMessage(`@${user}, You have already joined the Glimroyale`, "glimboi");
                            }
                        } else {
                            ChatMessages.filterMessage("@" + user + ", You do not have enough points to join the Glimroyale.", "glimboi")
                        }
                    }
                })
            }
        default:
        break;
    }
}

/**
 * Adds an active event if it does not already exist in the array
 */
function addEvent(event:eventName) {
    if (!arrayOfEvents.includes(event)) {
        arrayOfEvents.push(event);
    }
}

/**
 * Returns current events
 * @returns {array}
 */
function getCurrentEvents(): Array<any> {
    return arrayOfEvents
}

/**
 * Sets the current events
 * @param {array} data An array of updated events
 */
function setCurrentEvents(data:eventName[]) {
    arrayOfEvents = data
    console.log(arrayOfEvents)
}

/**
 * Removes an event if it exists
 */
function removeEvent(event:eventName) {
    if (arrayOfEvents.includes(event)) {
        arrayOfEvents.splice(arrayOfEvents.indexOf(event), 1);
    }
}

/**
 * Checks to see if an event is enabled
 */
function isEventEnabled(event:eventName) {
    return CacheStore.get(`${event}Enabled`, true, true);
}

/**
 * Checks to see if an event is currently active
 * @param {string} event
 */
function isEventActive(event:eventName) {
    return arrayOfEvents.includes(event);
}


export {addEvent, bankHeist, duel, getCurrentEvents, giveaway, glimRealm, glimroyale,
handleEvent, isEventActive, isEventEnabled, poll, raffle, removeEvent, setCurrentEvents}