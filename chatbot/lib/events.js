// This file contains games and events.
var raffleUsers = []; // array of users in the raffle. cleared on raffle end
var raffleTimer = {} // 1 minute timer for the raffle. Contains functions for controlling raffles.

var glimrealmUsers = [];
var glimrealmStatus = "ready";
/**
 *
 */
var pollHandle = {
    question: "",
    options: [],
    responses: [],
    results: {},
    users: []
};


/**
 * Event Handler. Inputs the event and does the required action with the other paramaters. This allows multiple events to be run at the same time.
 * @param {string} event
 * @param {string} user
 * @param {string} message
 */
function handleEvent(event, user, message) {
    switch (event) {
        case "raffle":
            if (message.startsWith('!enter')) {
                addUserRaffle(user)
            }
            break;
        case "poll":
            if (message.startsWith('!vote') || message.startsWith("!v")) {
                message = message.split(" ");
                if (message[1] == null || message[1] == undefined || message[1] == "") {
                    ChatMessages.filterMessage("@" + user + ", Please respond with a number indicating your response. ex. !vote 1, !v 1", "glimboi");
                } else if (!pollHandle.users.includes(user)) {
                    // Note that the number is a string, since we only subtract it nothing breaks.
                    pollHandle.users.push(user);
                    pollHandle.responses.push(message[1] - 1);
                } else {
                    console.log("The user " + user + " has already entered the poll or tried a conflicting command.");
                }
            }
            break;
        case "glimrealm":
            if (message.startsWith('!portal')) {
                if (!glimrealmUsers.includes(user)) {
                    UserHandle.findByUserName(user.toLowerCase()).then(data => {
                        if (data !== "ADDUSER") {
                            glimrealmUsers.push(user);
                            glimDropRealm(user, data)
                        } else {
                            ChatMessages.filterMessage("You must be a user in the bot to join this game. Type !user new " + user.toLowerCase(), "glimboi") // the user doesn't exist
                        }
                    })
                } else {
                    ChatMessages.filterMessage("@" + user + ", You have already entered the Glimrealm.", "glimboi")
                }
            }
            break;

        default:
            break;
    }
}

/**
 * Starts a raffle. Ends in one minute. Winner annoucned to chat and on GUI event page.
 * @param {number} time
 * @async
 */
async function startRaffle(time) {
    return new Promise(resolve => {
        console.log("Starting Raffle");
        ChatMessages.filterMessage("A raffle has begun! Type !enter to join the raffle. You have one minute remaining.")
        raffleTimer.timer = setTimeout(() => {
        arrayOfEvents = arrayOfEvents.filter(function(e) {return e !== "raffle"}) // removes from current events
          if (raffleUsers.length == 0) {
            ChatMessages.filterMessage("Nobody joined the raffle so nobody won.", "glimboi")
            resolve("Nobody joined the raffle so nobody won.")
            return;
        }
        raffleUsers = [...new Set(raffleUsers)]
        console.log(raffleUsers.length + " users joined the raffle.")
        console.log(raffleUsers)
        var index = Math.floor(Math.random()*raffleUsers.length)
        var winner = raffleUsers[index];
        raffleUsers = []
        ChatMessages.filterMessage("Congratulations @" + winner + ", you won the raffle!" , "glimboi")
        resolve(winner)
    }, time);
        raffleTimer.cancel = function() {
            resolve({status:"CANCELLED", reson:"MANUAL CANCELLATION"})
        }
    })
}

/**
 * Returns a set of users in the array. Will not contain duplicates.
 */
function getRaffleUsers() {
    return [...new Set(raffleUsers)]
}

/**
 * Adds a user to the raffle.
 * @param {string} user
 */
function addUserRaffle(user) {
    raffleUsers.push(user)
    raffleUsersUpdate(user)
}

/**
 * Stops the raffle.
 */
function stopRaffle() {
    raffleTimer.cancel()
    clearTimeout(raffleTimer);
    raffleUsers = [];
    arrayOfEvents = arrayOfEvents.filter(function(e) {return e !== "raffle"}) // removes from current events
}


async function startPoll(poll, time) {
    return new Promise(resolve => {
        if (poll == "" || poll == undefined || poll == null) {
            resolve("NOPOLL");
            return;
        } else {
            console.log(poll)
            pollHandle.options = poll.options

            ChatMessages.filterMessage("Poll Started! " + poll.user + " asks: " + poll.question, "glimboi");
            setTimeout(() => {
                var messageOptions = ""
                for (let index = 0; index < poll.options.length; index++) {
                    messageOptions = messageOptions.concat(`${index + 1}: ${poll.options[index]}, `)
                }
                ChatMessages.filterMessage("Choices: " + messageOptions + ". Respond with !vote NUMBER based on the option you choose.", "glimboi");
            }, 1000);

            var pollTimer = setTimeout(() => {
                console.log("Poll finished. Returning results.");
                arrayOfEvents = arrayOfEvents.filter(function(e) {return e !== "poll"})
                pollHandle.results = pollHandle.responses.reduce(function(obj, b) {
                    obj[b] = ++obj[b] || 1;
                    return obj;
                  }, {});
                var results = ""
                console.log(pollHandle)
                for (const key in pollHandle.results) {
                    console.log(key);
                    console.log(pollHandle.options[key]);
                    console.log(pollHandle.options)
                    results = results.concat(`${pollHandle.options[key]}: ${pollHandle.results[key]}, `)
                }
                console.log(results);
                ChatMessages.filterMessage("The results are in: " + results.slice(0, -1), "glimboi");
                pollHandle.options = [];
                pollHandle.responses = [];
                pollHandle.results = {};
                pollHandle.users = []
                pollHandle.question = ""
                resolve("POLLFINISHED")
            }, time);
        }
        pollHandle.cancel = function() {
            pollHandle.options = [];
            pollHandle.responses = [];
            pollHandle.results = {};
            pollHandle.users = []
            pollHandle.question = ""
            clearTimeout(pollTimer);
            resolve({status:"CANCELLED", reson:"MANUAL CANCELLATION"})
            ChatMessages.filterMessage("Poll cancelled.", "glimboi")
        }
    })
}

function stopPoll() {
    pollHandle.cancel()
}

/**
 * Starts a glimrealm instance. Activated by !glimrealm
 */
function openGlimrealm() {
    console.log("Opening the portal to the Glimrealm");
    glimrealmStatus = "active";
    setTimeout(() => {
        ChatMessages.filterMessage("The portal is beginning to destabilize...");
        setTimeout(() => {
            ChatMessages.filterMessage("The portal is nearly closed. 20 seconds left!");
            setTimeout(() => {
                ChatMessages.filterMessage("Everyone returned from the Glimrealm just as the portal closed. The portal will need some time to recharge.");
                console.log("GLimrealm portal closed.");
                glimrealmStatus = "charging";
                arrayOfEvents = arrayOfEvents.filter(function(e) {return e !== "glimrealm"}) // removes from current events
                glimrealmUsers = [];
                setTimeout(() => {
                    glimrealmStatus = "ready"
                }, 600000);
            }, 20000);
        }, 20000);
    }, 20000);
}

/// Retruns the status of the glimrealm portal
function getGlimrealmStatus() {
    return glimrealmStatus
}




/**
 * Enters the world of the Glimdrops.
 * @param {string} user
 */
function glimDropRealm(user, data) {
    console.log(data.points);
    var result = glimChance(); // get a random effect
    console.log(result);
    ChatMessages.filterMessage(result.message, "glimboi"); // send the message to chat
    if (result.type == "add") {
        UserHandle.editUserPoints(user.toLowerCase(), data.points + result.result); // add the points
    } else {
        if (data.points - result.result <= 0) {
            UserHandle.editUserPoints(user.toLowerCase(), 0); // reset to 0
        } else {
            UserHandle.editUserPoints(user.toLowerCase(), data.points - result.result); // subtract points
        }
    }
}

/**
 * Returns a random glimdrop event.
 */
function glimChance() {
    var number = Math.floor(Math.random()*30)
    switch (number) {
        case 0: return {message: "The Glimdrops are hiding. No adjustment in points.", result: 0, type: "add"}
        case 1: return {message: ":glimwow: got his Glimesh T-shirt! You gained 100 points.", result: 100, type: "add"}
        case 2: return {message: "You and :glimgype: got even more hyped! You gained 100 points!", result: 100, type: "add"}
        case 3: return {message: ":glimsad: is sad and you didn't do anything! You lost 50 points.", result: 50, type: "sub"}
        case 4: return {message: "You tripped over a Glimdrop. His friends didn't like that. You have lost 500 points!", result: 500, type: "sub"}
        case 5: return {message: "A Glimdrop hugs you. You have gained 100 points!", result: 100, type: "add"}
        case 6: return {message: ":glimsmile: You can't help but smile back. You gained 300 points!", result: 300, type: "add"}
        case 7: return {message: "A glimdrop won the lottery! He's feeling generous. You have gained 777 points!", result: 777, type: "add"}
        case 8: return {message: "A Glimdrop stole some points! You lost 100 points.", result: 100, type: "sub"}
        case 9: return {message: "A wild Glimdrop appears! He is friendly. You gained 200 points.", result: 200, type: "add"}
        case 10: return {message: "A wild Glimdrop appears! Oh no, he's coming straight toward you! ... You lost all your points.", result: 9000, type: "sub"}
        case 11: return {message: "You got a good nights rest. :glimsleepy: You gained 50 points.", result: 50, type: "sub"}
        case 12: return {message: "You watched your favorite streamer with your favorite Glimdrop. You gained 50 points! The other glimdrops were jealous. They [REDACTED]. Oh my... You lost a lot of points. ", result: 1000, type: "sub"}
        case 13: return {message: "A glimdrop is cozy next to the fire. You feel comforted. You gained 50 points.", result: 50, type: "add"}
        case 14: return {message: ":glimuwu: g o o d v i b e s You gained 50 points", result: 50, type: "add"}
        case 15: return {message: "You enjoyed some glimberry pie. The other Glimdrops didn't like that. You lost 100 points", result: 100, type: "sub"}
        case 16: return {message: "A group of Glimdrops got together and formed an alliance! You were not invited. You lost 200 points.", result: 200, type: "sub"}
        case 17: return {message: "A group of Glimdrops got together and formed an alliance! You joined them and took over the world. You gained 400 points!", result: 400, type: "add"}
        case 18: return {message: "The Glimdrops discovered glimberry pie, glimtaco, glimpizza, glimonade, glimcoffee, glimcake, and glimcheese! The glimdrops didn't like being turned into food. You lost 250 points.", result: 250, type: "sub"}
        case 19: return {message: "A Glimdrop discovered OBS. They became a top tier streamer! They made you a mod. You gained 100 points.", result: 100, type: "add"}
        case 20: return {message: "A Glimdrop is hungry. You were nearby. Oh no... You lost 300 points.", result: 300, type: "sub"}
        case 21: return {message: "A Glimdrop learned to fly! The Glimdrop didn't know how to land. You caught the Glimdrop and saved the day. You gained 300 points.", result: 300, type: "add"}
        case 22: return {message: "You introduce the Glimdrops to Glim-chan. You gained 200 points!", result: 200, type: "add"}
        case 23: return {message: "A Glimdrop evaporated! The other Glimdrops blame you. You lost 100 points.", result: 100, type: "sub"}
        case 24: return {message: "You became friends with a Glimdrop. You gained 75 points.", result: 75, type: "add"}
        case 25: return {message: "You teach a Glimdrop how to code and make a new feature for Glimesh! You gained 250 points", result: 250, type: "add"}
        case 26: return {message: ":glimtongue: You try some new food with Glimdrop. You gained 100 points.", result: 100, type: "add"}
        case 27: return {message: ":glimlove: You help two Glimdrops fall in love. After a year they get married and have more Glimdrops! You gain 500 points!", result: 500, type: "add"}
        case 28: return {message: ":glimangry: A Glimdrop is angry. You failed to calm it down. You lost 100 points", result: 100, type: "sub"}
        case 29: return {message: "A glimdrop discovered your stream and became a regular! You gained 100 points!", result: 100, type: "add"}
    }
}

module.exports = {addUserRaffle, getGlimrealmStatus, getRaffleUsers, glimDropRealm, handleEvent, openGlimrealm, startRaffle, startPoll, stopPoll, stopRaffle}