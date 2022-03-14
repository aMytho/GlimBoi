// This file contains games and events.

let arrayOfEvents:eventName[] = [];

const helper: typeof import("./events/helpers/helper") = require(appData[0] + "/modules/events/helpers/helper.js")

/**
 * Bankheist Controller
 */
const bankHeist: typeof import("./events/bankHeist") = require(appData[0] + "/modules/events/bankHeist.js");
/**
 * Poll Controller
 */
const poll: typeof import("./events/poll") = require(appData[0] + "/modules/events/poll.js");
/**
 * Duel Controller
 */
const duel: typeof import("./events/duel") = require(appData[0] + "/modules/events/duel.js");
/**
 * Glimrealm controller
 */
const glimRealm: typeof import("./events/glimRealm") = require(appData[0] + "/modules/events/glimRealm.js");
/**
 * Raffle controller
 */
const raffle: typeof import("../modules/events/raffle") = require(appData[0] + "/modules/events/raffle.js");
/**
 * Giveaway controller
 */
const giveaway: typeof import("./events/giveaway") = require(appData[0] + "/modules/events/giveaway.js");
/**
 * Glimroyale controller
 */
const glimroyale: typeof import("./events/glimRoyale") = require(appData[0] + "/modules/events/glimRoyale.js");
/**
 * Gamble Controller
 */
const gamble:typeof import("./events/gamble") = require(appData[0] + "/modules/events/gamble.js");
/**
 * Queue Controller
 */
const queue: typeof import("./events/queue") = require(appData[0] + "/modules/events/queue.js");

/**
 * Event Handler. Inputs the event and does the required action with the other paramaters. This allows multiple events to be run at the same time.
 * @param {string} event
 * @param {string} user
 * @param {string} message
 */
async function handleEvent(event:eventName, user:string, message: string) {
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
                user = user.toLowerCase();
                let userExists = await UserHandle.findByUserName(user);
                if (userExists !== "ADDUSER") {
                    let enteredGlimrealm = glimRealm.addGlimRealmUser(user, userExists.points);
                    if (!enteredGlimrealm) {
                        ChatMessages.filterMessage(`${user} has already entered the glimrealm.`, "glimboi");
                    }
                } else {
                    let userAdded = await UserHandle.addUser(user, false, user);
                    if (userAdded !== "INVALIDUSER" && userAdded !== "USEREXISTS") {
                        handleEvent("glimrealm", user, "!portal");
                    }
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
                let potentialUser = await UserHandle.findByUserName(user);
                if (potentialUser == "ADDUSER") {
                    let newUser = await UserHandle.addUser(user, false, user);
                    if (typeof newUser == "object") {
                        handleEvent(event, newUser.userName, message);
                    }
                } else {
                    if (helper.compareUserPoints(potentialUser, glimroyale.getWager(), true)) {
                        let joined = glimroyale.joinBattle(potentialUser.userName);
                        if (!joined) {
                            ChatMessages.filterMessage(`@${user}, You have already joined the Glimroyale`, "glimboi");
                        }
                    } else {
                        ChatMessages.filterMessage("@" + user + ", You do not have enough points to join the Glimroyale.", "glimboi");
                    }
                }
            }
            break;
            case "queue":
                if (message.startsWith('!join')) {
                    if (await queue.canJoinQueue(user, false)) {
                        queue.addToQueue(user);
                    }
                }
            break;
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
function getCurrentEvents(): Array<eventName> {
    return arrayOfEvents
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

export {addEvent, bankHeist, duel, gamble, getCurrentEvents, giveaway, glimRealm, glimroyale,
handleEvent, helper, isEventActive, isEventEnabled, poll, queue, raffle, removeEvent}