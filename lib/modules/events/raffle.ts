// This file handles raffles

let usersInRaffle: string[] = [];
let raffleTimer: NodeJS.Timeout = null;

/**
 * Adds a user to the raffle if they are not already in it
 * @param {string} user The user to add
 */
async function addUser(user: string) {
    if (usersInRaffle.indexOf(user) === -1) {
        // check to make sure they have enough points to enter the raffle
        let userExists = await UserHandle.findByUserName(user);
        let costToEnter = CacheStore.get("raffleCost", 50, false);
        if (userExists !== "ADDUSER") {
            if (userExists.points < CacheStore.get("raffleCost", 50, false)) {
                ChatMessages.sendMessage(`${user}, you do not have enough points to enter the raffle. ${userExists.points} | ${costToEnter}`);
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
            ChatMessages.sendMessage(getEnteredMessage(user));
        }
        if (currentPage == "events" && viewingEvent == "raffle") {
            fillUsersRaffle(user);
        }
    } else {
        ChatMessages.sendMessage(`${user} is already in the raffle`);
    }
}

/**
 * Returns the users who are in the raffle
 */
function getUsers(): string[] {
    return usersInRaffle;
}

/**
 * Starts the raffle
 * @param {string} user The user who is starting the raffle. If started from UI should be Glimboi
 */
async function startRaffle(user: string, fromUI?: boolean): Promise<boolean> {
    if (EventHandle.isEventEnabled("raffle")) {
        // check that a raffle is not already running
        if (EventHandle.isEventActive("raffle")) {
            ChatMessages.sendMessage(`A raffle is already in progress. !enter to join the raffle`);
            return false;
        } else {
            // check that we are in a chat
            if (!ChatHandle.isConnected()) {
                return false
            }
            // add the event to the array
            EventHandle.addEvent("raffle");
            ChatMessages.sendMessage(`A raffle has been started! Type !enter to enter the raffle`);
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
                    ChatMessages.sendMessage(`There was no winner for the raffle.`);
                    updateWinnerText("Nobody entered so nobody won.");
                } else {
                    // send the winner
                    ChatMessages.sendMessage(`${winner} has won the raffle! Awarding ${pointsToAward} ${CacheStore.get("pointsName", "Points")}'s to ${winner}.`);
                    console.log(`${winner} has won the raffle! Awarding ${pointsToAward} ${CacheStore.get("pointsName", "Points")}'s to ${winner}.`);
                    // give points to the winner
                    winner = winner.toLowerCase();
                    let userExists = await UserHandle.findByUserName(winner);
                    if (userExists) {
                        UserHandle.addPoints(winner, pointsToAward);
                    } else {
                        await UserHandle.addUser(winner, false);
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
        ChatMessages.sendMessage(`${user}, Raffles are not enabled.`);
        return false;
    }
}

/**
 * Returns a message to show that the user entered the raffle successfully
 * @param {string} user The user who entered the raffle
 */
function getEnteredMessage(user: string): string {
    // pick a random message
    let messages = [
        `${user} has joined the raffle.`,
        `${user} wants to win ${CacheStore.get("pointsName", "Points")}.`,
        `${user} wants to win the raffle!`,
        `${user} has entered the raffle.`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Stops the raffle
 */
function stopRaffle(): boolean {
    if (raffleTimer) {
        clearTimeout(raffleTimer);
        raffleTimer = null;
        usersInRaffle = [];
        EventHandle.removeEvent("raffle");
        ChatMessages.sendMessage(`The raffle has been stopped.`);
        updateWinnerText("Raffle Stopped.");
        return true
    } else {
        ChatMessages.sendMessage(`There is no raffle in progress.`);
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