// File handles giveaways (no reward, just picks a winner)

let usersInGiveaway:string[] = [];
let giveawayTimer:NodeJS.Timeout = null;

/**
 * Adds a user to the giveaway.
 * @param {string} user - The user to add.
 */
function addToGiveaway(user:string) {
    usersInGiveaway.push(user);
    // if quite mode is off, send a confirmation
    if (!CacheStore.get("giveawayQuiet", true, true)) {
        ChatMessages.sendMessage(getEnteredMessage(user));
    }
}

/**
 * Removes all users in the giveaway from the array.
 */
function resetGiveaway() {
    usersInGiveaway = [];
}

/**
 * Checks if a user entered the giveaway.
 * @param {string} user - The user to check.
 */
function isInGiveaway(user:string): boolean {
    return usersInGiveaway.indexOf(user) > -1;
}

/**
 * Adds a user to the giveaway if it is not already in it.
 * @param {string} user - The user who entered the giveaway.
 */
function enterGiveaway(user:string) {
    user = user.toLowerCase();
    if (!isInGiveaway(user)) {
        addToGiveaway(user);
    } else {
        ChatMessages.sendMessage(`${user}, you have already entered the giveaway`);
    }
}

/**
 * Starts a giveaway if it is able to be started.
 * @param {string} user - The user who started the giveaway.
 * @param {boolean} fromChat - Was this started from chat?
 */
function startGiveaway(fromChat: boolean, user?:string) {
    if (Util.isEventEnabled("giveaway", "The giveaway is not enabled.")) {
        if (EventHandle.isEventActive("giveaway")) {
            if (fromChat) {
                ChatMessages.sendMessage(`${user}, there is already a giveaway in progress`);
            } else {
                errorMessage("Giveaway Error", "There is already a giveaway in progress");
            }
            return;
        }
        if (!ChatHandle.isConnected()) {
            errorMessage("Giveaway Error", "You must be connected to chat to start a giveaway");
            return;
        }
        if (!fromChat) {
            successMessage("Giveaway Started", `A giveaway has begun!`);
        }
        EventHandle.addEvent("giveaway");
        ChatMessages.sendMessage(`The giveaway has started! Type !enter to join the giveaway!`);
        if (user) {
            enterGiveaway(user);
        }
        giveawayTimer = setTimeout(() => {
            EventHandle.removeEvent("giveaway");
            // pick a winner
            let winner = usersInGiveaway[Math.floor(Math.random() * usersInGiveaway.length)];
            // reset the giveaway
            resetGiveaway();
            // send the winner
            ChatMessages.sendMessage(`The winner is: ${winner}!`);
        }, CacheStore.get("giveawayDuration", 60000, true));
    } else {
        if (!fromChat) {
            errorMessage("Giveaway Error", `The giveaway is not enabled`);
        }
    }
}

/**
 * Returns a message with the users name to show that they have entered the giveaway.
 * @param {string} user - The user who entered the giveaway.
 */
function getEnteredMessage(user:string): string {
    // possible messages with the user's name
    let possibleMessages = [
        `${user}, you have entered the giveaway!`,
        `${user} is feeling lucky!`,
        `${user} wants to win the giveaway!`,
        `${user} has joined the giveaway!`
    ];
    // return a random message
    return possibleMessages[Math.floor(Math.random() * possibleMessages.length)];
}

/**
 * Stops the giveaway
 * @param {string} fromUI - Was this called from the UI?
 */
function stopGiveaway(fromUI?: boolean): void {
    EventHandle.removeEvent("giveaway");
    clearTimeout(giveawayTimer);
    resetGiveaway();
    ChatMessages.sendMessage(`The giveaway has been stopped.`);
    if (fromUI) {
        successMessage("Giveaway Stopped", "The giveaway has been stopped.");
    }
}

export {enterGiveaway, startGiveaway, stopGiveaway};