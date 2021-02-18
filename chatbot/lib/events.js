// This file contains games and events. 
var raffleUsers = []; // array of users in the raffle. cleared on raffle end
var raffleTimer = {} // 1 minute timer for the raffle. Contains functions for controlling raffles.

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


module.exports = {addUserRaffle, getRaffleUsers, handleEvent, startRaffle, stopRaffle}