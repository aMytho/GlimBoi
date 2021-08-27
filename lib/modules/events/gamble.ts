// This file manages gambling.. fun !

async function gamble(user:userName, wager:number) {
    let chanceOfWinning = CacheStore.get("gambleChance", 20, true);
    let baseEarnings = CacheStore.get("gambleEarnings", 1.5, true);
    let actualEarnings = baseEarnings * wager;

    // take the chance of winning and see if the user won
    if (chanceOfWinning < Math.round(Math.random() * 100)) {
        UserHandle.addPoints(user, actualEarnings);
        ChatMessages.filterMessage(getGambleMessage("win", user, actualEarnings));
    } else {
        UserHandle.removePoints(user, wager);
        ChatMessages.filterMessage(getGambleMessage("lose", user, wager), "glimboi");
    }
}


function getGambleMessage(purpose: "win" | "lose", user: userName, amount?: number) {
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

export {gamble}