/**
 *Handles all poll data, questions, and results
 */
 var pollHandle = {
    question: "",
    options: [],
    responses: [],
    results: {},
    users: []
};


function startPoll(poll, time) {
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
function checkPollStatus(user, message, GUI, stringMessage) {
    var currentEvents = EventHandle.getCurrentEvents()
    if (currentEvents.includes("poll")) {
        console.log("A poll is already in progress.");
        if (GUI) {
            errorMessage("Poll in Progress", "A poll is already in progress. Only one poll can be run at a time.");
        }
        return
    } else {
        if (GUI && ChatHandle.isConnected()) {
            var options = document.getElementsByClassName("pollOption");
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
                    var pollError = document.getElementById("PollModalText").innerHTML = "No Question was selected.";
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
                        document.getElementById("pollResults").innerText = "Poll Cancelled"
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
 * We use this function to add a user to a poll or to reset it.
 * @param {array} data Updated array
 */
function updatePollData(user, response) {
    pollHandle.users.push(user);
    pollHandle.responses.push(response);
}

module.exports = {checkPollStatus , getUsers, startPoll, stopPoll, updatePollData}