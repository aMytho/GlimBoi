// handles the poll event

let PollController: PollController = {
    question: "",
    options: [],
    responses: [],
    status: "ready"
}
let pollTimer: NodeJS.Timer = null;

function getPollStatus() {
    return PollController.status
}

function resetPoll() {
    clearTimeout(pollTimer);
    PollController.question = ""
    PollController.options = []
    PollController.responses = []
    PollController.status = "ready"
    EventHandle.removeEvent("poll");
}

function startPoll(question: string, options: string[], user: userName) {
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
            getResponseAndEndPoll();
        }, CacheStore.get("pollDuration", 60000, true));
        return true;
    } else {
        ChatMessages.filterMessage("A poll is already active", "glimboi");
        return false;
    }
}

function listOptions() {
    let options = ``
    for (let i = 0; i < PollController.options.length; i++) {
        options += `\n${i + 1}. ${PollController.options[i]} `
    }
    return options
}

// takes the user's response and adds it to the list of responses
function addResponse(response: number, user: userName) {
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

function getResponseAndEndPoll() {
    let result = getResults();
    ChatMessages.filterMessage(result.message, "glimboi");
    resetPoll();
}

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

function stopPoll() {
    resetPoll();
    ChatMessages.filterMessage("Poll stopped", "glimboi");
}


// export the functions
export { addResponse, getPollStatus, resetPoll, startPoll, stopPoll };