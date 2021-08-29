// This file manages gambling.. fun !

async function gamble(user:userName, wager:number) {
    // check to make sure that the user exists and has enough points to wager
    if (!EventHandle.helper.compareUserPoints(user, wager, true)) {
        ChatMessages.filterMessage(`${user}, you do not have enough points to wager.`, "glimboi");
        return
    }

    let chanceOfWinning = CacheStore.get("gambleWinRate", 20, true);
    let baseEarnings = CacheStore.get("gambleMultiplier", 1.5, true);
    let actualEarnings = Math.round(baseEarnings * wager);

    let hasWon = chanceOfWinning >= Math.round(Math.random() * 100);

    // take the chance of winning and see if the user won
    if (hasWon) {
        UserHandle.addPoints(user, actualEarnings);
        ChatMessages.filterMessage(getGambleMessage("win", user, actualEarnings));
    } else {
        UserHandle.removePoints(user, Math.round(wager));
        ChatMessages.filterMessage(getGambleMessage("lose", user, Math.round(wager)), "glimboi");
    }
}


function getGambleMessage(purpose: "win" | "lose", user: userName, amount: number) {
    if (purpose == "win") {
        let possibleMessages = [
            `Congratulations ${user}! You just won ${amount} ${CacheStore.get("pointsName", "Points", false)}`,
            `${user} just won ${amount} ${CacheStore.get("pointsName", "Points", false)}!`,
            `${user} is walking away with ${amount} ${CacheStore.get("pointsName", "Points", false)}`,
        ];
        return possibleMessages[Math.floor(Math.random() * possibleMessages.length)];
    } else {
        let possibleMessages = [
            `${user} just lost ${amount} ${CacheStore.get("pointsName", "Points", false)}`,
            `${user} cries because they just lost ${amount} ${CacheStore.get("pointsName", "Points", false)}`,
            `${user} wasn't very lucky :glimcry: . -${amount} ${CacheStore.get("pointsName", "Points", false)}`,
        ];
        return possibleMessages[Math.floor(Math.random() * possibleMessages.length)];
    }
}

function chanceForAlternateEnding() {
    return 1 == Math.round(Math.random() * 10)
}

export {gamble}