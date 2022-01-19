// handles the poll event
// Poll controller holds the poll info
let PollController: PollController = {
    question: "",
    options: [],
    responses: [],
    status: "ready"
}; // Duration of the poll
let pollTimer: NodeJS.Timer = null;

/**
 * Returns the poll status
 * @returns {pollStatus}
 */
function getPollStatus(): pollStatus {
    return PollController.status
}

/**
 * Resets the poll
 */
function resetPoll() {
    clearTimeout(pollTimer);
    PollController.question = ""
    PollController.options = []
    PollController.responses = []
    PollController.status = "ready"
    EventHandle.removeEvent("poll");
}

/**
 * Starts the poll. Returns boolean if poll was started successfully
 * @param {string} question
 * @param {string[]} options
 * @param {string} user
 */
function startPoll(question: string, options: string[], user: string) {
    if (!EventHandle.isEventActive("poll")) {
        if (!CacheStore.get("pollEnabled", true, false) || !ChatHandle.isConnected()) {
            return false
        }
        PollController.status = "active";
        PollController.question = question;
        PollController.options = options;
        ChatMessages.filterMessage(`${user} asks: ${PollController.question}? Options: ${listOptions()}`, "glimboi");
        EventHandle.addEvent("poll");
        setTimeout(() => {
            ChatMessages.filterMessage(`Respond with !v # to vote.`, "glimboi");
        }, 3000);
        pollTimer = setTimeout(() => {
            let result = getResults();
            ChatMessages.filterMessage(result.message, "glimboi");
            resetPoll();
        }, CacheStore.get("pollDuration", 60000, true));
        return true;
    } else {
        ChatMessages.filterMessage("A poll is already active", "glimboi");
        return false;
    }
}

/**
 * Lists all the poll options
 * @returns {string}
 */
function listOptions(): string {
    let options = ``
    for (let i = 0; i < PollController.options.length; i++) {
        options += `\n${i + 1}. ${PollController.options[i]} `
    }
    return options
}

/**
 * Takes the response add it to the poll responses
 * @param {number} response
 * @param {string} user
 */
function addResponse(response: number, user: string) {
    console.log(user, response);
    // Check if the user has already voted
    for (let i = 0; i < PollController.responses.length; i++) {
        if (PollController.responses[i].user === user) {
            ChatMessages.filterMessage(`${user} has already voted`, "glimboi");
            return
        }
    }
    // check that the response is a valid option
    if (response <= 0 || response > PollController.options.length) {
        ChatMessages.filterMessage(`${user} has entered an invalid option`, "glimboi");
    } else {
        PollController.responses.push({ user: user, vote: response - 1 });
    }
}

/**
 * Gets the results
 */
function getResults(): pollResult {
    let pollResult:pollResult = {
        message: "",
        chosen: ""
    };
    console.log(JSON.stringify(PollController));
    if (PollController.responses.length === 0) {
        pollResult.chosen = "no-votes";
        pollResult.message = "No votes have been cast";
        return pollResult;
    } else {
        // create an object to store the vote and its count
        let voteCount: { [key: number]: number } = {};
        // iterate through the responses and add them to the voteCount object
        for (let i = 0; i < PollController.responses.length; i++) {
            let response = PollController.responses[i];
            if (voteCount[response.vote] === undefined) {
                voteCount[response.vote] = 1;
            } else {
                voteCount[response.vote]++;
            }
        }
        // find the highest vote
        let maxVote = 0;
        for (let i = 0; i < PollController.options.length; i++) {
            if (voteCount[i] > maxVote) {
                maxVote = voteCount[i];
                pollResult.chosen = `${i} is the winner`;
            }
        }
        // create the message to display
        let message = `Results: `;
        for (let i = 0; i < PollController.options.length; i++) {
            if (voteCount[i] === maxVote) {
                message += `\n | ${i + 1}. ${PollController.options[i]} - ${maxVote} votes |`;
            }
        }
        pollResult.message = message;
        return pollResult;
    }
}

/**
 * Stops the poll
 */
function stopPoll() {
    resetPoll();
    ChatMessages.filterMessage("Poll stopped", "glimboi");
}

export { addResponse, getPollStatus, resetPoll, startPoll, stopPoll };