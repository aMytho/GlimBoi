// This file contains games and events. 
var raffleUsers = []; // array of users in the raffle. cleared on raffle end
var raffleTimer = {} // 1 minute timer for the raffle. Contains functions for controlling raffles.

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
                    ChatHandle.filterMessage("@" + user + ", Please respond with a number indicating your response. ex. !vote 1, !v 1", "glimboi");
                } else if (!pollHandle.users.includes(user)) {
                    // Note that the number is a string, since we only subtract it nothing breaks.
                    pollHandle.users.push(user);
                    pollHandle.responses.push(message[1]-1);
                } else {
                    console.log("The user " + user + " has already entered the poll or tried a conflicting command.");
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
        ChatHandle.filterMessage("A raffle has begun! Type !enter to join the raffle. You have one minute remaining.")
        raffleTimer.timer = setTimeout(() => {
        arrayOfEvents = arrayOfEvents.filter(function(e) {return e !== "raffle"}) // removes from current events
          if (raffleUsers.length == 0) {
            ChatHandle.filterMessage("Nobody joined the raffle so nobody won.", "glimboi")
            resolve("Nobody joined the raffle so nobody won.")
            return;
        }
        raffleUsers = [...new Set(raffleUsers)]
        console.log(raffleUsers.length + " users joined the raffle.")
        console.log(raffleUsers)
        var index = Math.floor(Math.random()*raffleUsers.length)
        var winner = raffleUsers[index];
        raffleUsers = []
        ChatHandle.filterMessage("Congratulations @" + winner + ", you won the raffle!" , "glimboi")
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

            ChatHandle.filterMessage("Poll Started! " + poll.user + " asks: " + poll.question, "glimboi");
            setTimeout(() => {
                var messageOptions = ""
                for (let index = 0; index < poll.options.length; index++) {
                    messageOptions = messageOptions.concat(`${index + 1}: ${poll.options[index]}, `)
                }
                ChatHandle.filterMessage("Choices: " + messageOptions + ". Respond with !vote NUMBER based on the option you choose.", "glimboi");
            }, 1000);

            setTimeout(() => {
                console.log("Poll finished. Returning results.");
                arrayOfEvents = arrayOfEvents.filter(function(e) {return e !== "poll"})
                pollHandle.results = pollHandle.responses.reduce(function(obj, b) {
                    obj[b] = ++obj[b] || 1;
                    return obj;
                  }, {});
                var results = ""
                console.log(pollHandle)
                for (const key in pollHandle.results) {
                    results = results.concat(`${pollHandle.options[key]}: ${pollHandle.results[key]}, `)
                }
                console.log(results);
                ChatHandle.filterMessage("The results are in: " + results.slice(0, -1), "glimboi")
            }, time);
        }
        pollHandle.cancel = function() {
            resolve({status:"CANCELLED", reson:"MANUAL CANCELLATION"})
        }
    })
}

function stopPoll() {
    pollHandle.cancel()
}

module.exports = {addUserRaffle, getRaffleUsers, handleEvent, startRaffle, startPoll, stopPoll, stopRaffle}