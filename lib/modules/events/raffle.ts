// This file handles raffles

let usersInRaffle: userName[] = [];
let raffleTimer: NodeJS.Timeout = null;

/**
 * Adds a user to the raffle if they are not already in it
 * @param {string} user The user to add
 */
async function addUser(user: userName) {
    if (usersInRaffle.indexOf(user) === -1) {
        // check to make sure they have enough points to enter the raffle
        let userExists = await UserHandle.findByUserName(user);
        let costToEnter = CacheStore.get("raffleCost", 50, false);
        if (userExists !== "ADDUSER") {
            if (userExists.points < CacheStore.get("raffleCost", 50, false)) {
                ChatMessages.filterMessage(`${user}, you do not have enough points to enter the raffle. ${userExists.points} | ${costToEnter}`, "glimboi");
                return;
            } else {
                UserHandle.removePoints(userExists.userName, costToEnter);
            }
        } else {
            UserHandle.addUser(user, false, user);
            addUser(user);
            return;
        }
        usersInRaffle.push(user);
        // if quiet mode is disabled, send a message to the user
        if (!CacheStore.get("raffleQuiet", false, false)) {
            ChatMessages.filterMessage(getEnteredMessage(user), "glimboi");
        }
        if (currentPage == "events" && viewingEvent == "raffle") {
            fillUsersRaffle(user);
        }
    } else {
        ChatMessages.filterMessage(`${user} is already in the raffle`, "glimboi");
    }
}

/**
 * Returns the users who are in the raffle
 * @returns {string[]} The users who are in the raffle
 */
function getUsers(): string[] {
    return usersInRaffle;
}

/**
 * Starts the raffle
 * @param {string} user The user who is starting the raffle. If started from UI should be Glimboi
 * @returns {Promise<boolean>} True if the raffle was started, false if it was not
 * @async
 */
async function startRaffle(user: userName, fromUI?: boolean): Promise<boolean> {
    if (EventHandle.isEventEnabled("raffle")) {
        // check that a raffle is not already running
        if (EventHandle.isEventActive("raffle")) {
            ChatMessages.filterMessage(`A raffle is already in progress. !enter to join the raffle`, "glimboi");
            return false;
        } else {
            // check that we are in a chat
            if (!ChatHandle.isConnected()) {
                return false
            }
            // add the event to the array
            EventHandle.addEvent("raffle");
            ChatMessages.filterMessage(`A raffle has been started! Type !enter to enter the raffle`, "glimboi");
            if (user && fromUI) {
                addUser(user.toLowerCase());
            }
            // set the timer
            raffleTimer = setTimeout(async () => {
                // pick a winner
                let winner = usersInRaffle[Math.floor(Math.random() * usersInRaffle.length)];
                let pointsToAward: number = CacheStore.get(`rafflePoints`, 777, true);
                // check to make sure there is a winner
                if (!winner) {
                    ChatMessages.filterMessage(`There was no winner for the raffle.`, "glimboi");
                    updateWinnerText("Nobody entered so nobody won.");
                } else {
                    // send the winner
                    ChatMessages.filterMessage(`${winner} has won the raffle! Awarding ${pointsToAward} ${settings.Points.name}'s to ${winner}.`, "glimboi");
                    console.log(`${winner} has won the raffle! Awarding ${pointsToAward} ${settings.Points.name}'s to ${winner}.`);
                    // give points to the winner
                    winner = winner.toLowerCase();
                    let userExists = await UserHandle.findByUserName(winner);
                    if (userExists) {
                        UserHandle.addPoints(winner, pointsToAward);
                    } else {
                        await UserHandle.addUser(winner, false, "glimboi");
                        UserHandle.addPoints(winner, pointsToAward);
                    }
                    // update the ui to show the winner
                    updateWinnerText(`${winner} has won the raffle!`);
                }
                // reset the timer and the users in the raffle
                raffleTimer = null;
                usersInRaffle = [];
                // remove the event
                EventHandle.removeEvent("raffle");
            }, CacheStore.get("raffleDuration", 60000, true));
            return true;
        }
    } else {
        ChatMessages.filterMessage(`${user}, Raffles are not enabled.`, "glimboi");
        return false;
    }
}

/**
 * Returns a message to show that the user entered the raffle successfully
 * @param {string} user The user who entered the raffle
 * @returns {string} The message to show
 */
function getEnteredMessage(user: userName): string {
    // pick a random message
    let messages = [
        `${user} has joined the raffle.`,
        `${user} wants to win ${settings.Points.name}.`,
        `${user} wants to win the raffle!`,
        `${user} has entered the raffle.`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Stops the raffle
 * @returns {boolean} True if the raffle was stopped, false if it was not
 */
function stopRaffle(): boolean {
    if (raffleTimer) {
        clearTimeout(raffleTimer);
        raffleTimer = null;
        usersInRaffle = [];
        EventHandle.removeEvent("raffle");
        ChatMessages.filterMessage(`The raffle has been stopped.`, "glimboi");
        updateWinnerText("Raffle Stopped.");
        return true
    } else {
        ChatMessages.filterMessage(`There is no raffle in progress.`, "glimboi");
        return false
    }
}

/**
 * Updates the winner text on the UI with a message
 * @param {string} message The message to show
 */
function updateWinnerText(message:string): void {
    if (currentPage == "events" && viewingEvent == "raffle") {
        document.getElementById("raffleWinner").innerText = message;
    }
}

// export the functions
export = { addUser, getUsers, startRaffle, stopRaffle };