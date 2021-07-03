// This file handles raffles

var raffleUsers:userName[] = []
var raffleTimer = {timer: null}


/**
 * Starts a raffle. Ends in one minute. Winner annoucned to chat and on GUI event page.
 * @param {number} time
 */
function startRaffle(time:number) {
    return new Promise(resolve => {
        console.log("Starting Raffle");
        ChatMessages.filterMessage("A raffle has begun! Type !enter to join the raffle. You have one minute remaining.", "glimboi")
        raffleTimer.timer = setTimeout(() => {
            var events = EventHandle.getCurrentEvents()
        	events = events.filter(function(e) {return e !== "raffle"}) // removes from current events
            EventHandle.setCurrentEvents(events)
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
        // @ts-ignore
        raffleTimer.cancel = function() {
            console.log("Raffle Cancelled")
            resolve({status:"CANCELLED", reson:"MANUAL CANCELLATION"})
        }
    })
}

/**
 * Checks if a raffle can be run, and if so starts a raffle
 * @param {boolean} GUI Checks the source of the raffle
 */
function checkRaffleStatus(GUI:boolean, chatActive?: boolean) {
    var events = EventHandle.getCurrentEvents()
    if (events.includes("raffle")) {
        console.log("A raffle is already in progress.");
        if (GUI) {
            errorMessage("Raffle In progress", "A raffle is already in progres. Only one raffle can be run at a time. ")
        }
    } else if (chatActive) {
        events.push("raffle");
        EventHandle.setCurrentEvents(events)
        try {
            document.getElementById("raffleWinner")!.innerText = "Determining Winner...";
        } catch (e) {}
        startRaffle(60000).then(data => {
            if (typeof data !== "object") {
            	console.log("The winner is " + data);
            	try {
                	$("#RaffleUserList").empty();
                	if (data == "Nobody joined the raffle so nobody won.") {
                        // @ts-ignore
                    	document.getElementById('raffleWinner')!.innerText = data
                	} else {
                    	document.getElementById('raffleWinner')!.innerText = data + " won!"
                	}
            	} catch (e) { }
        	} else {
            	try {
                	$("#RaffleUserList li").remove()
                	document.getElementById("raffleWinner")!.innerText = "Raffle Cancelled"
            	} catch(e) {
            	}
        	}
        })
    } else {
        errorMessage("Raffle Error", "You must be in a chat to start a raffle.")
    }
}

/**
 * Returns a set of users in the array. Will not contain duplicates.
 */
 function getRaffleUsers(): userName[] {
    return [...new Set(raffleUsers)]
}

/**
 * Adds a user to the raffle.
 * @param {string} user
 */
function addUserRaffle(user:userName) {
    raffleUsers.push(user)
    raffleUsersUpdate(user)
}

/**
 * Stops the raffle.
 */
function stopRaffle() {
    var currentEvents = EventHandle.getCurrentEvents()
    if (!currentEvents.includes("raffle")) {
        errorMessage("Raffle Error", "No raffle is in progress.")
    } else {
        // @ts-ignore
        raffleTimer.cancel()
        clearTimeout(raffleTimer.timer);
        raffleUsers = [];
        currentEvents = currentEvents.filter(function (e) { return e !== "raffle" }) // removes from current events
        EventHandle.setCurrentEvents(currentEvents)
    }
}

export {addUserRaffle, checkRaffleStatus, getRaffleUsers, startRaffle, stopRaffle}