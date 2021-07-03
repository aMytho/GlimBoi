
// Handles the Poll event

/**
 *Handles all poll data, questions, and results
 */
 var pollHandle: PollController = {
    question: "",
    options: [],
    responses: [],
    results: {},
    users: []
};


function startPoll(poll, time:number) {
    return new Promise(resolve => {
        if (poll == "" || poll == undefined || poll == null) {
            resolve("NOPOLL");
            return;
        } else {
            try { $('#pollUserList').modal('hide')} catch(e){}
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
                var arrayOfEvents = EventHandle.getCurrentEvents()
                arrayOfEvents = arrayOfEvents.filter(function(e) {return e !== "poll"});
                EventHandle.setCurrentEvents(arrayOfEvents)
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
                ChatMessages.filterMessage("The results are in: " + results.slice(0, -1), "glimboi");
                try {document.getElementById("PollListModalText")!.innerText = results.slice(0, -1)} catch(e) {}
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
            var arrayOfEvents = EventHandle.getCurrentEvents()
            arrayOfEvents = arrayOfEvents.filter(function(e) {return e !== "poll"});
            EventHandle.setCurrentEvents(arrayOfEvents)
            resolve({status:"CANCELLED", reson:"MANUAL CANCELLATION"})
            ChatMessages.filterMessage("Poll cancelled.", "glimboi")
        }
    })
}

function stopPoll() {
    var currentEvents = EventHandle.getCurrentEvents()
    if (currentEvents.includes("poll")) {
        pollHandle.cancel()
    } else {
        errorMessage("Poll error.", "No poll is active.")
    }
}

/**
 * Checks if a poll can be run, and if so starts a poll.
 * @param {string} user The user who activated the poll
 * @param {string} message The entire chat message
 * @param {boolean} GUI Was this actived from the GUI?
 * @param {string} stringMessage The message from chat, is parsed.
 * @returns
 */
function checkPollStatus(user:userName, message:message, GUI:boolean, stringMessage) {
    var currentEvents = EventHandle.getCurrentEvents()
    if (currentEvents.includes("poll")) {
        console.log("A poll is already in progress.");
        if (GUI) {
            errorMessage("Poll in Progress", "A poll is already in progress. Only one poll can be run at a time.");
        }
        return
    } else {
        if (GUI && ChatHandle.isConnected()) {
            var options = (document.getElementsByClassName("pollOption") as HTMLCollectionOf<HTMLParagraphElement>)
            var pollOptions = [];
            for (let index = 0; index < options.length; index++) {
                console.log(options[index].innerText);
                if (options[index].innerText !== "" && options[index].innerText !== undefined && options[index].innerText !== null) {
                    pollOptions.push(options[index].innerText)
                }
            }
            console.log(pollOptions);
            if (!user) {
                user = ChatHandle.getBotName();
            }
            currentEvents.push("poll");
            EventHandle.setCurrentEvents(currentEvents)
            startPoll({ question: message, options: pollOptions, user: user }, 25000).then(data => {
                if (data == "NOPOLL") {
                    var pollError = document.getElementById("PollModalText")!
                    pollError.innerText = "No Question was selected.";
                    setTimeout(() => {
                        pollError.innerText = ""
                    }, 3000);
                }
            })
            $("#modalPoll").modal("hide");
        } else if (ChatHandle.isConnected()) {
            currentEvents.push("poll");
            EventHandle.setCurrentEvents(currentEvents)
            console.log(stringMessage);
            stringMessage = stringMessage.slice(6)
            var questionEnd = stringMessage.indexOf("?");
            console.log(questionEnd);
            var question = stringMessage.substring(questionEnd + 1);
            var possibleAnswers = question.split('|');
            console.log(possibleAnswers);
            for (let index = 0; index < possibleAnswers.length; index++) {
                possibleAnswers[index] = possibleAnswers[index].trim()
            }
            console.log(possibleAnswers);
            startPoll({ question: stringMessage.slice(0, questionEnd + 1), options: possibleAnswers, user: user }, 60000).then(data => {
                if (data == "POLLFINISHED") {
                    console.log("The poll has finsished");
                } else if (data == { status: "CANCELLED", reson: "MANUAL CANCELLATION" }) {
                    try {
                        document.getElementById("pollResults")!.innerText = "Poll Cancelled"
                    } catch (e) {
                    }
                }
            })
        } else {
            errorMessage("Poll Error", "You must be in a chat to start a poll.")
        }
    }
}

/**
 * Gets the users in the poll
 * @returns {array}
 */
function getUsers() {
    return pollHandle.users;
}

/**
 * We use this function to add a user to a poll and display it.
 * @param {array} data Updated array
 */
function updatePollData(user:userName, response: number) {
    console.log(user, response)
    pollHandle.users.push(user);
    pollHandle.responses.push(response);
    try {
        let newRow = document.createElement("tr");
        let userPoll = document.createElement("td");
        userPoll.innerText = user;
        newRow.appendChild(userPoll);
        for (let i = 0; i < pollHandle.options.length; i++) {
            let userChoice = document.createElement("td");
            let icon = document.createElement("span");

            if (pollHandle.options.indexOf(pollHandle.options[i]) == response) {
                icon.innerHTML = `<i class="fas fa-check"></i>`
                userChoice.appendChild(icon)
            } else {
                icon.innerHTML = `<i class="fas fa-times"></i>`
                userChoice.appendChild(icon)
            }
            newRow.appendChild(userChoice)
        }
        document.getElementById("pollDataTableBody")!.appendChild(newRow)
    } catch(e) {console.log(e)}
}

function getPollStatus() {
    // Creates the options in the table
    for (let i = 0; i < pollHandle.options.length; i++) {
        let option = document.createElement("th");
        option.innerText = pollHandle.options[i];
        option.scope = "col";
        document.getElementById("pollOptionsHeader")!.appendChild(option)
    }
    var body = document.createElement("tbody");
    body.id = "pollDataTableBody"
    // Now we log the users choices
    for (let i = 0; i < pollHandle.responses.length; i++) {
        let userRow = document.createElement("tr"); // for each user that responds
        let userName = document.createElement("td");
        userName.innerText = pollHandle.users[i];
        userRow.appendChild(userName)
        // fill the options with data
        for (let index = 0; index < pollHandle.options.length; index++) {
            let userChoice = document.createElement("td");
            if (index == (pollHandle.responses[i])) {
                var icon = document.createElement("span");
                icon.innerHTML = `<i class="fas fa-check"></i>`
                userChoice.appendChild(icon)
            } else {
                var icon = document.createElement("span");
                icon.innerHTML = `<i class="fas fa-times"></i>`
                userChoice.appendChild(icon)
            }
            userRow.appendChild(userChoice)
        }
        body.appendChild(userRow)
    }
    document.getElementById("pollTable")!.appendChild(body)
}

function getPoll() {
    return pollHandle
}

export {checkPollStatus , getPollStatus, getUsers, startPoll, stopPoll, updatePollData, getPoll}