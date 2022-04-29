// Files handles chat duels

// array containing all the active duels
let duels: duel[] = [];
let duelTimers = {};

// function to add the user to the duel with a specified opponent
function addDuel(user: string, opponent: string, points: number): void {
    let newDuel: duel = {user: user, opponent: opponent, status: "pending", points: points}
    duels.push(newDuel);
    EventHandle.addEvent("duel");
}

// check if the user/opponent is already in a duel
function userIsInDuel(user: string): boolean {
    for (let i = 0; i < duels.length; i++) {
        if (duels[i].user == user || duels[i].opponent == user) {
            return true;
        }
    }
    return false;
}

// remove a duel with a specified user and opponent
function removeDuel(user: string, opponent: string, messageUser?: boolean): void {
    duelTimers[`${user}`] = clearTimeout(duelTimers[`${user}`]);
    for (let i = 0; i < duels.length; i++) {
        if (duels[i].user == user && duels[i].opponent == opponent) {
            duels.splice(i, 1);
            if (messageUser) {
                ChatMessages.sendMessage(`${opponent} did not respond to the challenge from ${user}. Duel cancelled.`);
            }
            // check if any duels are left, if so remove from event list
            if (duels.length == 0) {
                EventHandle.removeEvent("duel");
            }
            return;
        }
    }
}

// pick a winner of the duel
function pickWinner(duel: duel): duelVictor {
    // pick between the the user and the opponent
    // @ts-ignore
    let winner:duelVictor= {};
    console.log(duel, winner)
    winner.pointsWon = duel.points;
    if (Math.round(Math.random()) == 0) {
        winner.winner = duel.user;
        winner.loser = duel.opponent;
    } else {
        winner.winner = duel.opponent;
        winner.loser = duel.user;
    }
    return winner;
}

// Check who won and distrubiute the points. Then remove them from the duel array
function deterMineVictorAndDistributePoints(duel: duel): void {
    console.log("determinign victor")
    let winner: duelVictor = pickWinner(duel);
    let loser: string = winner.loser;
    let wager: number = duel.points;
    console.log(winner, loser, wager);
    UserHandle.addPoints(winner.winner, wager);
    UserHandle.removePoints(loser, wager);
    ChatMessages.sendMessage(`${winner.winner} has won the duel with a wager of ${wager} ${CacheStore.get("pointsName", "Points")} against ${loser}!`);
    removeDuel(winner.winner, loser);
}
// Checks to ensure that a user, opponent, and wager are valid. Also makes sure that the user doesn't have a pending duel
async function challengeUser(user: string, opponent: string, wager: number) {
    if (!opponent) {
        return ChatMessages.sendMessage("Please specify an opponent and wager. !duel opponent wager");
    }
    user = user.toLowerCase();
    opponent = opponent.toLowerCase();
    if (isNaN(wager)) {
        wager = 0;
    }
    let challenger = await UserHandle.findByUserName(user);
    if (challenger == "ADDUSER") {
        let possibleChallenger = await UserHandle.addUser(user, false, user);
        if (possibleChallenger == "INVALIDUSER") {
            return ChatMessages.sendMessage("Invalid user!");
        }
        challengeUser(user, opponent, wager);
        return
    }
    let opponentUser = await UserHandle.findByUserName(opponent);
    if (opponentUser == "ADDUSER") {
        let possibleOpponent = await UserHandle.addUser(opponent, false, user);
        if (possibleOpponent == "INVALIDUSER") {
            return ChatMessages.sendMessage("Invalid user!");
        }
        challengeUser(user, opponent, wager);
        return
    }
    if (userIsInDuel(user)) {
        ChatMessages.sendMessage("You are already in a duel!");
    } else if (userIsInDuel(opponent)) {
        ChatMessages.sendMessage("Your opponent is already in a duel!");
    } else if (wager <= 0 || typeof wager !== "number") {
        return ChatMessages.sendMessage("You must wager at least 1 point!");
    } else if (wager > challenger.points) {
        return ChatMessages.sendMessage("You don't have enough points to wager!");
    } else if (wager > opponentUser.points) {
        return ChatMessages.sendMessage("Your opponent doesn't have enough points to wager!");
    } else {
        addDuel(user, opponent, wager);
        ChatMessages.sendMessage(`${opponent}, ${user} has challenged you to a duel with a wager of ${wager} ${CacheStore.get("pointsName", "Points")}! !accept or !decline.`);
        duelTimers[`${user}`] = setTimeout(() => {
            removeDuel(user, opponent);
        }, 30000);
    }
}

// function to have the user accept the duel
async function acceptDuel(opponent: string) {
    opponent = opponent.toLowerCase();
    let duel: duel = duels.find(d => d.opponent == opponent);
    if (duel !== undefined) {
        if (duel.status == "pending") {
            duel.status = "active";
            ChatMessages.sendMessage(`${opponent} has accepted the duel!`);
            deterMineVictorAndDistributePoints(duel);
        } else {
            ChatMessages.sendMessage("You are already in a duel!");
        }
    } else {
        ChatMessages.sendMessage(`${opponent}, nobody has challenged you to a duel.`);
    }
}

// decline a duel
async function declineDuel(opponent: string) {
    opponent = opponent.toLowerCase();
    let duel: duel = duels.find(d => d.opponent == opponent);
    if (duel !== undefined) {
        if (duel.status == "pending") {
            removeDuel(duel.user, opponent);
            ChatMessages.sendMessage(`${opponent} has declined the duel!`);
        } else {
            ChatMessages.sendMessage("You are already in a duel!");
        }
    } else {
        ChatMessages.sendMessage(`${opponent}, nobody has challenged you to a duel.`);
    }
}

/**
 * Returns any active duels
 */
function getDuels() {
    return [duels, duelTimers];
}

export {acceptDuel, declineDuel, challengeUser, getDuels}