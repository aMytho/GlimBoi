// This file handles the bankheist event.

let bankHeistStatus = "ready" // status of the heist
let users = []; // all the users in the heist
let currencyGained = 0; // how much money the raiders recieve

/**
 * Starts or joins a bankheist
 * @param {string} user The user who starts/joins a bankheist
 */
function startBankHeist(user) {
    if (bankHeistStatus == "ready") {
        ChatMessages.filterMessage(user + " had just started a bankheist. Type !bankheist to join! Starts in 30 seconds.");
        users.push(user);
        bankHeistStatus = "prep"
        startPrep()
    } else if (bankHeistStatus == "prep" && !users.includes(user)) {
        users.push(user);
        ChatMessages.filterMessage(rallyMessage(user), "glimboi")
    } else if (bankHeistStatus == "active") {
        ChatMessages.filterMessage("The bankheist had already begun. You can join in the next round.", "glimboi");
    } else {
        ChatMessages.filterMessage("You have already joined the team!", "glimboi")
    }
}

/**
 * Prepares the heist.
 */
function startPrep() {
    setTimeout(() => {
        if (users.length <= 1) {
            console.log("Not enough users for a bankheist");
            ChatMessages.filterMessage("There were not enough users for a bankheist. You need a minimum of two members to particapate.", "glimboi");
            bankHeistStatus = "ready";
        } else {
            console.log("Starting bankheist!");
            bankHeistStatus = "active"
            ChatMessages.filterMessage("Your team approaches the bank. You enter through the front door.");
            walkIn()
        }
    }, 30000);
}

/**
 * Enter the bank.
 */
function walkIn() {
    currencyGained = 0
    setTimeout(() => {
        // 50% to go undetected
        if (probability(0.5)) {
            console.log("They managed to sneak in as normal customers.");
            ChatMessages.filterMessage("The bank did not notice your group as you slipped in. Your team moved towards the back rooms undetected.", "glimboi");
            setTimeout(() => {
                if (probability(0.1)) {
                    var number = Math.floor(Math.random()*users.length);
                    ChatMessages.filterMessage(`${users[number]} saw a jar of candy at one of the registers. They head back to grab some.`, "glimboi");
                    if (probability(0.5)) {
                        ChatMessages.filterMessage(`${users[number]} was discovered! The alarm is raised. ${users[number]} grabs the jar of candy and regroups with your team!`, "glimboi");
                        bankDoor(true)
                    } else {
                        ChatMessages.filterMessage(`${users[number]} retrieved the jar undetected! They get to enjoy a nice snack later :glimsmile: They regroup with your team.`);
                        bankDoor(false)
                    }
                } else {
                    bankDoor(false)
                }
            }, 2000);
        } else {
            console.log("The bank discovered you!");
            ChatMessages.filterMessage("The bank realized you were not normal customers! They trigger the alarm. Everyone freezes.");
            setTimeout(() => {
                ChatMessages.filterMessage("A group of guards appear! They ask your team to stand down. Your group readies for a fight.");
                setTimeout(() => {
                    // 70% chance to NOT lose someone.
                    if (probability(0.7)) {
                        ChatMessages.filterMessage("The guards have been dealth with. Your team had no casualities! Moving to the next room.");
                        bankDoor(true)
                    } else {
                        var number = Math.floor(Math.random()*users.length);
                        ChatMessages.filterMessage(`${users[number]} was hit in the action :glimrip: The guards in the front room have been dealt with. Your team moves to the next room.`)
                        users.splice(number, 1);
                        if (users.length == 0) {
                            console.log("BankHeist failed!");
                            ChatMessages.filterMessage("Everyone on your team has been captured! A glimdrop :glimsmile: will post bail for them in 10 minutes.");
                            bankHeistFailed()
                        } else {
                            bankDoor(true)
                        }
                    }
                }, 4000);
            }, 3000);
        }
    }, 3500);
}

/**
 * Break into the vault!
 * @param {boolean} alramActivated Is the alarm activated?
 */
function bankDoor(alramActivated) {
    if (alramActivated) {
        //50% chance of losing someone
        ChatMessages.filterMessage("Your team has reached the vault door. You begin to unlock it. Since the alarm is activated it will take more time. Guards begin to head for the vault entrance...", "glimboi");
        setTimeout(() => {
            if (probability(50)) {
                var number = Math.floor(Math.random() * users.length);
                ChatMessages.filterMessage(`${users[number]} was hit in the action :glimrip: The guards surrounding the vault have been dealt with. Your team opens the vault and begins to loot.`, "glimboi");
                users.splice(number, 1);
                if (users.length == 0) {
                    bankHeistFailed()
                } else {
                    currencyInBank();
                    escapeSequence(false, currencyGained)
                }
            } else {
                ChatMessages.filterMessage("Your team holds off the guards easily. You open the vault and begin to loot.", "glimboi");
                currencyInBank();
                escapeSequence(false, currencyGained)
            }
        }, 5000);
    } else {
        setTimeout(() => {
            ChatMessages.filterMessage(`Your team reached the vault door. You start working on the vault security system. After a few mintues the door unlocks and your team moves in.`, "glimboi");
        }, 4000);
        setTimeout(() => {
            ChatMessages.filterMessage(`Your team starts to loot the vault. The backup security system kicks in and the alarm is raised! Your teams scrables to leave the vault and begins to escape`, "glimboi")
            currencyInBank()
            escapeSequence(true, currencyGained)
        }, 8000);
    }
}

/**
 * Escaping the bank
 * @param {boolean} justTriggeredAlarm Was the alarm just triggered?
 * @param {number} currencyLooted How much the vault contained
 */
function escapeSequence(justTriggeredAlarm, currencyLooted) {
    setTimeout(() => {
        ChatMessages.filterMessage(`Your team has looted the vault and collected a total of ${currencyLooted} ${settings.Points.name}. Don't relax yet, you still have to escape!`, "glimboi");
        if (justTriggeredAlarm) {
            if (probability(0.5)) {
                var number = Math.floor(Math.random() * users.length);
                ChatMessages.filterMessage(`${users[number]} was captured while trying to escape :glimsad: `, "glimboi")
                users.splice(number, 1);
                if (users.length == 0) {
                    bankHeistFailed()
                } else {
                    ChatMessages.filterMessage(`:glimmoney: The team escaped with ${currencyGained} ${settings.Points.name}!`, "glimboi");
                    distributePoints(currencyLooted, users);
                }
            } else {
                ChatMessages.filterMessage(`The team escaped without being captured! Your team gained a total of ${currencyLooted} ${settings.Points.name}. It will be divided among the successful raiders.`, "glimboi");
                distributePoints(currencyLooted, users)
            }
        } else {
            if (probability(0.7)) {
                var number = Math.floor(Math.random() * users.length);
                ChatMessages.filterMessage(`${users[number]} was captured while trying to escape :glimsad: `, "glimboi")
                users.splice(number, 1);
                if (users.length == 0) {
                    bankHeistFailed()
                } else {
                    ChatMessages.filterMessage(`:glimmoney: The team escaped with ${currencyGained} ${settings.Points.name}! It will be divided among the successful raiders`, "glimboi");
                    distributePoints(currencyLooted, users)
                }
            } else {
                ChatMessages.filterMessage(`:glimmoney: The team escaped with ${currencyGained} ${settings.Points.name} ! It will be divided among the successful raiders`, "glimboi");
                distributePoints(currencyLooted, users)
            }
        }
    }, 3500);
}

/**
 * Ends the bankheist
 */
function bankHeistFailed() {
    console.log("BankHeist failed!");
    setTimeout(() => {
        ChatMessages.filterMessage("Everyone on your team has been captured! A glimdrop :glimsmile: will post bail for them in 10 minutes.");
        resetUsers()
        bankHeistStatus = "cooldown";
        setTimeout(() => {
            bankHeistStatus = "ready"
        }, 60000);
    }, 5000);
}

/**
 * Distributes points to the users who succeeded
 * @param {number} points The total amount of points awarded to the team
 * @param {array} users Array of users who succeeded
 * @async
 */
function distributePoints(points, users) {
    setTimeout(() => {
        var pointsPerUser = Math.round(points / users.length);
        users.forEach(async function (element) {
            var userExists = await UserHandle.findByUserName(element);
            if (userExists !== "ADDUSER") {
                UserHandle.addPoints(element, pointsPerUser);
            } else {
                var userAdded = await UserHandle.addUser(element, false);
                if (userAdded !== "INVALIDUSER") {
                    UserHandle.addPoints(element, points)
                }
            }
        })
        resetUsers()
        console.log("Bankheist complete!");
        bankHeistStatus = "cooldown";
        setTimeout(() => {
            bankHeistStatus = "ready"
        }, 600000);
    }, 5000);
}

/**
 * Returns a randome rally message.
 */
function rallyMessage(user) {
    var number = Math.floor(Math.random()*4);
    switch (number) {
        case 0: return `Yay :glimhype:, ${user} is here!`
        case 1:
            return `${user} has joined the party!`
            break;
        case 2:
            return `${user} showed up to raid!`
        case 3: return `${user} is here to help!`
            break;
        case 4: return `${user} is looking for a new financial opportunity.`
            break;
            default: return `${user} is ready!`
            break;
    }
}

/**
 * Resets the user array
 */
function resetUsers() {
    users = []
}

/**
 * Generates a random number larger than 500.
 */
function currencyInBank() {
    var possibleCurrency = Math.round(Math.random()*1500);
    if (possibleCurrency < 100) {
        possibleCurrency = possibleCurrency + 500
    } else if (possibleCurrency < 200) {
        possibleCurrency = possibleCurrency + 400
    } else if (possibleCurrency < 300) {
        possibleCurrency = possibleCurrency + 300
    } else if (possibleCurrency < 400) {
        possibleCurrency = possibleCurrency + 200
    } else if (possibleCurrency < 500) {
        possibleCurrency = possibleCurrency + 100
    }
    currencyGained = currencyGained + possibleCurrency
}


/**
 * Random chance. Pass the value you want to test. ex 0.5
 * @param {number} n The probablity to test
 * @returns {number}
 */
function probability(n){
    return Math.random() < n;
}


module.exports = {startBankHeist}