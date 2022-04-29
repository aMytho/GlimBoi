// File handles the glimrRoyale chat game

let glimRoyaleStatus: glimRoyaleStatus = "pending"
let usersInBattle: glimRoyaleUser[] = [];
let glimRoyaleLobby: NodeJS.Timeout = null;
let resultsOfEachMatch: glimroyaleTurn[] = [];
let wager = 0;
let weapons:glimRoyaleWeapon[] = [
    {id: 1, name: "Fist", stats: {bonusHP: 0, damage: 10}},
    {id: 2, name: "Pistol", stats: {bonusHP: 0, damage: 20}},
    {id: 3, name: "Rifle", stats: {bonusHP: 0, damage: 30}},
    {id: 4, name: "Shotgun", stats: {bonusHP: 0, damage: 40}},
    {id: 5, name: "Sniper", stats: {bonusHP: 0, damage: 50}},
    {id: 6, name: "Grenade", stats: {bonusHP: 0, damage: 60}},
    {id: 7, name: "Flamer", stats: {bonusHP: 0, damage: 20}},
    {id: 9, name: "Glimdrop", stats: {bonusHP: 100, damage: 40}},
]

function startGlimRoyale(user:string, points: number, fromUI?: boolean) {
    if (!ChatHandle.isConnected()) {return false}
    let currentStatus = statusCheck();
    if (currentStatus == "active") {
        ChatMessages.sendMessage("The battle is already in progress.");
        return false;
    } else if (currentStatus == "cooldown") {
        ChatMessages.sendMessage("The battle is in cooldown. Please wait.");
        return false;
    } else { // we can start a new battle
        EventHandle.addEvent("glimroyale")
        glimRoyaleStatus = "active";
        waitInLobby();
        wager = points;
        if (!fromUI) {
            joinBattle(user);
        }
        return true;
    }
}

function waitInLobby() {
    console.log("Waiting for the glimroyale match to start");
    ChatMessages.sendMessage("The battle is starting soon! Type !join to join the Glimroyale.");
    glimRoyaleLobby = setTimeout(() => {
        beginMatch();
    }, 30000);
}

function beginMatch() {
    // make sure there are at least 2 users in battle
    if (usersInBattle.length < 2) {
        ChatMessages.sendMessage("Not enough users in battle", "glimboi");
        endMatch("", false);
    } else {
        ChatMessages.sendMessage("The battle has started! Results will be posted after the battle has ended.");
        // start the battle. Each user needs to fight another. Continue until one user is left
        console.log(JSON.stringify(usersInBattle));
        while (usersInBattle.length > 1) {
            console.log(JSON.stringify(usersInBattle));
            // pick 2 random users from the list
            let user1 = usersInBattle[Math.floor(Math.random() * usersInBattle.length)];
            let user2 = usersInBattle[Math.floor(Math.random() * usersInBattle.length)];
            if (user1.user == user2.user) {
                continue; // you can't fight yourself
            }
            // start the battle
            let user1Weapon = getWeapon();
            let user2Weapon = getWeapon();
            // check if the weapon gives bonus hp
            if (user1Weapon.stats.bonusHP > 0) {
                user1.HP += user1Weapon.stats.bonusHP;
            }
            if (user2Weapon.stats.bonusHP > 0) {
                user2.HP += user2Weapon.stats.bonusHP;
            }
            // take turns attacking each other until one user is left
            while (user1.HP > 0 && user2.HP > 0) {
                // user1 attacks
                user1.HP -= (user2Weapon.stats.damage + chanceForExtraDamage());
                // make sure the user1's HP is not below 0
                if (user1.HP <= 0) {
                    continue;
                }
                // user2 attacks
                user2.HP -= (user1Weapon.stats.damage + chanceForExtraDamage());
            }
            // check if user1 won
            if (user1.HP <= 0) {
                // call logResult passing an object with a property of message describing what happened
                logResult({ message: `${user2.user} has won against ${user1.user}`, user: user1.user });
                // remove user2 from battle
                usersInBattle.splice(usersInBattle.indexOf(user1), 1);
            }
            // check if user2 won
            if (user2.HP <= 0) {
                // call logResult passing an object with a property of message describing what happened
                logResult({ message: `${user1.user} has won against ${user2.user}`, user: user2.user });
                // remove them from battle
                usersInBattle.splice(usersInBattle.indexOf(user2), 1);
            }
            // award the victor extra HP
            if (user1.HP > 0) {
                chanceOfExtraHP(user1.user);
            }
            if (user2.HP > 0) {
                chanceOfExtraHP(user2.user);
            }
            console.log(JSON.stringify(usersInBattle), JSON.stringify(user1), JSON.stringify(user2), );
        }
        console.log(JSON.stringify(usersInBattle));
        endMatch(getVictoryMessage(usersInBattle[0].user), false);
    }

}

async function endMatch(message: string, forced?: boolean) {
    if (!message) {
        glimRoyaleStatus = "pending";
        clearTimeout(glimRoyaleLobby);
        usersInBattle = [];
        resultsOfEachMatch = [];
        wager = 0;
        EventHandle.removeEvent("glimroyale");
        ChatMessages.sendMessage("Glimroyale stopped");
        successMessage("Glimroyale Stopped", "Glimroyale has been stopped manually.");
        return
    }
    setTimeout(async () => {
        console.log(JSON.stringify(resultsOfEachMatch), usersInBattle);
        if (forced) {
            ChatMessages.sendMessage("Glimroyale stopped");
            successMessage("Glimroyale Stopped", "Glimroyale has been stopped manually.");
        } else {
            if (!CacheStore.get("glimroyaleQuiet", false, true)) {
                await sendResults(resultsOfEachMatch);
            }
            ChatMessages.sendMessage(message, "glimboi");
            // award the victor everyone elses wagers
            let pointsToAward = wager * (resultsOfEachMatch.length + 1);
            UserHandle.addPoints(usersInBattle[0].user, pointsToAward);
            // Remove points from everyone else
            for (let i = 0; i < resultsOfEachMatch.length; i++) {
                UserHandle.removePoints(resultsOfEachMatch[i].user, wager);
            }
        }
        glimRoyaleStatus = "pending";
        clearTimeout(glimRoyaleLobby);
        usersInBattle = [];
        resultsOfEachMatch = [];
        wager = 0;
        EventHandle.removeEvent("glimroyale");
    }, CacheStore.get("glimroyaleDuration", 60000, true));
}

function logResult(log: glimroyaleTurn) {
    resultsOfEachMatch.push(log);
}

async function sendResults(results: glimroyaleTurn[]) {
    for (let i = 0; i < results.length; i++) {
        await new Promise(resolve => {
            setTimeout(() => {
                ChatMessages.sendMessage(results[i].message);
                resolve(true);
            }, 2500);
        })
    } // waits 2.5 seconds after completion
    await new Promise(resolve => {setTimeout(() => {resolve(true);}, 2500);})
}

function statusCheck() {
    return glimRoyaleStatus;
}

function joinBattle(user:string) {
    if (glimRoyaleStatus == "active") {
        // check if usersInBattle username property already exists
        for (let i = 0; i < usersInBattle.length; i++) {
            if (usersInBattle[i].user == user) {
                return false
            }
        }
        usersInBattle.push({ user: user.toLowerCase(), HP: 100 });
        userIntro(user);
        return true;
    } else {
        return false;
    }
}

function getWeapon() {
    return weapons[Math.floor(Math.random() * weapons.length)];
}

/**
 * Function retruns extra damage if any. Basically a critical hit
 */
function chanceForExtraDamage() {
    return Math.floor(Math.random() * 15);
}

function chanceOfExtraHP(user: string) {
    let extraHPToAdd = Math.floor(Math.random() * 50);
    if (extraHPToAdd > 0) {
        for (let i = 0; i < usersInBattle.length; i++) {
            if (usersInBattle[i].user == user) {
                usersInBattle[i].HP += extraHPToAdd;
            }
        }
    }
}

function getVictoryMessage(user: string) {
    // choose random message from array
    let messages = [
        `${user} has won the battle!`,
        `${user} is victorious!`,
        `${user} is the last person standing!`,
        `${user} has won the Glimroyale!`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

function getSlainMessage(victor: string, victorWeapon: glimRoyaleWeapon, opponent: string, opponentWeapon: glimRoyaleWeapon) {

}

function getWager() {
    return wager
}


function userIntro(user: string) {
    let messages = [
        `Welcome to Glimroyale, ${user}!`,
        `${user} has joined the Glimroyale. They stand waiting... MENACINGLY`,
        `${user} trembles in fear...`,
        `${user} is ready to face the Glimroyale!`,
        `${user} prepares for battle!`
    ];
    ChatMessages.sendMessage(messages[Math.floor(Math.random() * messages.length)]);
}

export {startGlimRoyale, statusCheck, joinBattle, endMatch, getWager}